using System.Security.Cryptography;
using System.Text;

namespace Beelina.LIB.Helpers
{
    public static class SystemUtility
    {
        public static class EncryptionUtility
        {
            /// <summary>
            /// Compute hash for string encoded as UTF8
            /// </summary>
            /// <param name="s">String to be hashed</param>
            /// <returns>40-character hex string</returns>
            public static string Encrypt(string s)
            {
                byte[] bytes = Encoding.UTF8.GetBytes(s);

                using (var sha1 = SHA1.Create())
                {
                    byte[] hashBytes = sha1.ComputeHash(bytes);

                    return HexStringFromBytes(hashBytes);
                }
            }

            /// <summary>
            /// Convert an array of bytes to a string of hex digits
            /// </summary>
            /// <param name="bytes">array of bytes</param>
            /// <returns>String of hex digits</returns>
            public static string HexStringFromBytes(byte[] bytes)
            {
                var sb = new StringBuilder();
                foreach (byte b in bytes)
                {
                    var hex = b.ToString("x2");
                    sb.Append(hex);
                }
                return sb.ToString();
            }

            public static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
            {
                using (var hmac = new System.Security.Cryptography.HMACSHA512())
                {
                    passwordSalt = hmac.Key;
                    passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                }
            }
        }
    }
}
