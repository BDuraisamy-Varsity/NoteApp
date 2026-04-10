using Microsoft.Extensions.Logging;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;
using Polly.Timeout;

namespace NoteApp.Infrastructure.Resilience;

/// <summary>
/// Centralised Polly resilience policies per CLAUDE.md:
///   Retry     — 3 attempts, exponential backoff 1s/2s/4s
///   Circuit   — opens after 5 failures in 30s, resets after 60s
///   Timeout   — 10s per operation
/// </summary>
public static class ResiliencePolicies
{
    public static ResiliencePipeline CreateDatabasePipeline(ILogger logger)
    {
        return new ResiliencePipelineBuilder()
            .AddTimeout(BuildTimeoutOptions())
            .AddRetry(BuildRetryOptions(logger))
            .AddCircuitBreaker(BuildCircuitBreakerOptions(logger))
            .Build();
    }

    private static TimeoutStrategyOptions BuildTimeoutOptions() =>
        new() { Timeout = TimeSpan.FromSeconds(10) };

    private static RetryStrategyOptions BuildRetryOptions(ILogger logger) =>
        new()
        {
            MaxRetryAttempts = 3,
            Delay = TimeSpan.FromSeconds(1),
            BackoffType = DelayBackoffType.Exponential,
            OnRetry = args =>
            {
                logger.LogWarning(
                    "Retry attempt {Attempt} after {Delay}s. Exception={Exception}",
                    args.AttemptNumber + 1,
                    args.RetryDelay.TotalSeconds,
                    args.Outcome.Exception?.Message);
                return ValueTask.CompletedTask;
            }
        };

    private static CircuitBreakerStrategyOptions BuildCircuitBreakerOptions(ILogger logger) =>
        new()
        {
            FailureRatio = 0.5,
            MinimumThroughput = 5,
            SamplingDuration = TimeSpan.FromSeconds(30),
            BreakDuration = TimeSpan.FromSeconds(60),
            OnOpened = args =>
            {
                logger.LogError(
                    "Circuit breaker OPENED. Break for {Duration}s. Exception={Exception}",
                    args.BreakDuration.TotalSeconds,
                    args.Outcome.Exception?.Message);
                return ValueTask.CompletedTask;
            },
            OnClosed = _ =>
            {
                logger.LogInformation("Circuit breaker CLOSED — service recovered.");
                return ValueTask.CompletedTask;
            }
        };
}
