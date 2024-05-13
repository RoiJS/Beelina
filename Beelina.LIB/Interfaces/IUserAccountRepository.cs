using Beelina.LIB.Enums;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IUserAccountRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<List<UserAccount>> GetUserAccounts(int userId = 0, string filterKeyword = "", CancellationToken cancellationToken = default);
        Task<bool> DeleteMultipleUserAccounts(List<int> userIds);
        Task<bool> SetMultipleUserAccountsStatus(List<int> userIds, bool state);
        Task<UserAccount> Register(UserAccount account, string password);
        Task<UserAccount> Login(string username, string password, bool byPassAuthentication = false);
        Task<bool> UserExists(string username, int userId = 0);
        EncryptedPassword GenerateNewPassword(string password);
        RefreshToken GenerateNewRefreshToken();
        Task RemoveExpiredRefreshTokens();
        Task<List<UserAccount>> GetAllSalesAgents();
        Task<UserPermission> GetCurrentUsersPermissionLevel(int userId, ModulesEnum moduleId);
    }
}
