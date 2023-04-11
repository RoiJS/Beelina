using Beelina.LIB.Helpers;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Security.Principal;

namespace Beelina.LIB.BusinessLogic
{
    public class UserAccountRepository
        : BaseRepository<UserAccount>, IUserAccountRepository<UserAccount>
    {

        public UserAccountRepository(IBeelinaRepository<UserAccount> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {

        }

        public async Task<UserAccount> Register(UserAccount account, string password)
        {
            var encryptedPassword = GenerateNewPassword(password);

            account.PasswordHash = encryptedPassword.PasswordHash;
            account.PasswordSalt = encryptedPassword.PasswordSalt;

            await AddEntity(account);

            return account;
        }

        public async Task<bool> UserExists(string username, int userId = 0)
        {
            var user = await _beelinaRepository.ClientDbContext.UserAccounts.Where(x => x.Username == username).FirstOrDefaultAsync();

            if (user != null && user.Id != userId)
                return true;
            return false;
        }

        public async Task<UserAccount> Login(string username, string password)
        {
            var account = await _beelinaRepository.ClientDbContext.UserAccounts
                .Where(x => x.Username == username)
                .Includes(a => a.RefreshTokens)
                .FirstOrDefaultAsync();

            if (account == null)
            {
                return null;
            }

            if (!VerifyPasswordHash(password, account.PasswordHash, account.PasswordSalt))
            {
                return null;
            }

            return account;
        }

        public EncryptedPassword GenerateNewPassword(string newPassword)
        {
            byte[] passwordHash, passwordSalt;

            SystemUtility.EncryptionUtility.CreatePasswordHash(newPassword, out passwordHash, out passwordSalt);

            return new EncryptedPassword
            {
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt
            };
        }

        public RefreshToken GenerateNewRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);

                return new RefreshToken
                {
                    Token = Convert.ToBase64String(randomNumber),
                    ExpirationDate = DateTime.Now.AddDays(5)
                };
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != passwordHash[i]) return false;
                }
            }

            return true;
        }

        public async Task RemoveExpiredRefreshTokens()
        {
            // Get all expired refresh tokens
            var expiredRefreshTokens = await _beelinaRepository
                                                .ClientDbContext.RefreshTokens
                                                .Where(r => DateTime.Now > r.ExpirationDate)
                                                .ToListAsync();

            // Delete expired refresh tokens
            _beelinaRepository.ClientDbContext.RefreshTokens.RemoveRange(expiredRefreshTokens);
        }
    }
}
