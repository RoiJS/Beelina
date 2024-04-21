using Beelina.LIB.Enums;
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

        public async Task<List<UserAccount>> GetUserAccounts(int userId = 0, string filterKeyword = "", CancellationToken cancellationToken = default)
        {
            var usersFromRepo = await _beelinaRepository
                                            .ClientDbContext
                                            .UserAccounts
                                            .Where(u =>
                                                !u.IsDelete
                                                && (userId == 0 || (userId > 0 && u.Id == userId))
                                            )
                                            .Includes(a => a.UserPermissions)
                                            .ToListAsync(cancellationToken);

            var finalUserAccountsFromRepo = (from u in usersFromRepo
                                             where (filterKeyword != "" && (u.FirstName.IsMatchAnyKeywords(filterKeyword) || u.MiddleName.IsMatchAnyKeywords(filterKeyword) || u.LastName.IsMatchAnyKeywords(filterKeyword) || u.Username.IsMatchAnyKeywords(filterKeyword)) || filterKeyword == "")
                                             select u).ToList();

            return finalUserAccountsFromRepo;
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

        public async Task<bool> DeleteMultipleUserAccounts(List<int> userIds)
        {
            var selectedUserAccounts = await _beelinaRepository
                .ClientDbContext
                .UserAccounts
                .Where(t => userIds.Contains(t.Id)).ToListAsync();

            DeleteMultipleEntities(selectedUserAccounts);
            return await SaveChanges();
        }

        public async Task<bool> SetMultipleUserAccountsStatus(List<int> userIds, bool state)
        {
            var selectedUserAccounts = await _beelinaRepository
                .ClientDbContext
                .UserAccounts
                .Where(t => userIds.Contains(t.Id)).ToListAsync();

            SetMultipleEntitiesStatus(selectedUserAccounts, state);
            return await SaveChanges();
        }

        public async Task<List<UserAccount>> GetAllSalesAgents()
        {
            var salesAgentAccounts = await _beelinaRepository.ClientDbContext.UserAccounts
                            .Includes(a => a.UserPermissions)
                            .ToListAsync();

            return salesAgentAccounts.Where(x => x.UserPermissions.Any(u => u.ModuleId == ModulesEnum.Distribution && u.PermissionLevel == PermissionLevelEnum.User)).ToList();
        }

        public async Task<UserAccount> Login(string username, string password)
        {
            var account = await _beelinaRepository.ClientDbContext.UserAccounts
                .Where(
                    x => x.Username == username
                    && x.IsActive
                    && !x.IsDelete
                )
                .Includes(
                    a => a.RefreshTokens,
                    a => a.UserPermissions
                )
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

        public async Task<UserPermission> GetCurrentUsersPermissionLevel(int userId, ModulesEnum moduleId)
        {
            var userPermission = await _beelinaRepository.ClientDbContext.UserPermission
                .Where(up =>
                    up.UserAccountId == userId
                    && up.ModuleId == moduleId
                    && !up.IsDelete
                    && up.IsActive)
                .FirstOrDefaultAsync();

            return userPermission;
        }
    }
}
