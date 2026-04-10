using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;

namespace NoteApp.Application.Behaviors;

/// <summary>
/// MediatR pipeline behavior that runs FluentValidation validators before any handler.
/// Throws ValidationException if any validator fails — caught by ExceptionHandlingMiddleware.
/// </summary>
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;
    private readonly ILogger<ValidationBehavior<TRequest, TResponse>> _logger;

    public ValidationBehavior(
        IEnumerable<IValidator<TRequest>> validators,
        ILogger<ValidationBehavior<TRequest, TResponse>> logger)
    {
        _validators = validators;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);
        var failures = await RunValidatorsAsync(context, cancellationToken);

        if (failures.Count != 0)
        {
            _logger.LogWarning(
                "Validation failed for {RequestType}. Errors={Errors}",
                typeof(TRequest).Name,
                string.Join("; ", failures.Select(f => f.ErrorMessage)));

            throw new ValidationException(failures);
        }

        return await next();
    }

    private async Task<List<FluentValidation.Results.ValidationFailure>> RunValidatorsAsync(
        ValidationContext<TRequest> context,
        CancellationToken cancellationToken)
    {
        var results = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        return results
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();
    }
}
