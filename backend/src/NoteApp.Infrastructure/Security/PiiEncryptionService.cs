using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace NoteApp.Infrastructure.Security;

/// <summary>
/// AES-256-CBC encryption service for PII fields.
/// Key is read from configuration — never hardcoded.
/// </summary>
public interface IPiiEncryptionService
{
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
}

public class PiiEncryptionService : IPiiEncryptionService
{
    private readonly byte[] _key;
    private readonly ILogger<PiiEncryptionService> _logger;

    public PiiEncryptionService(IConfiguration configuration, ILogger<PiiEncryptionService> logger)
    {
        _logger = logger;
        var keyString = configuration["Encryption:Key"]
            ?? throw new InvalidOperationException("Encryption:Key is not configured.");
        _key = DeriveKey(keyString);
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) return plainText;

        using var aes = CreateAes();
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

        var combined = CombineIvAndCipher(aes.IV, cipherBytes);
        return Convert.ToBase64String(combined);
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText)) return cipherText;

        try
        {
            var combined = Convert.FromBase64String(cipherText);
            var (iv, cipher) = SplitIvAndCipher(combined);

            using var aes = CreateAes();
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor();
            var plainBytes = decryptor.TransformFinalBlock(cipher, 0, cipher.Length);
            return Encoding.UTF8.GetString(plainBytes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PII decryption failed — returning empty string.");
            return string.Empty;
        }
    }

    private Aes CreateAes()
    {
        var aes = Aes.Create();
        aes.Key = _key;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        return aes;
    }

    private static byte[] DeriveKey(string keyString)
    {
        using var sha = SHA256.Create();
        return sha.ComputeHash(Encoding.UTF8.GetBytes(keyString));
    }

    private static byte[] CombineIvAndCipher(byte[] iv, byte[] cipher)
    {
        var combined = new byte[iv.Length + cipher.Length];
        Buffer.BlockCopy(iv, 0, combined, 0, iv.Length);
        Buffer.BlockCopy(cipher, 0, combined, iv.Length, cipher.Length);
        return combined;
    }

    private static (byte[] iv, byte[] cipher) SplitIvAndCipher(byte[] combined)
    {
        const int ivLength = 16;
        var iv = new byte[ivLength];
        var cipher = new byte[combined.Length - ivLength];
        Buffer.BlockCopy(combined, 0, iv, 0, ivLength);
        Buffer.BlockCopy(combined, ivLength, cipher, 0, cipher.Length);
        return (iv, cipher);
    }
}
