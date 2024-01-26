using Beelina.LIB.Enums;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IUserAccountRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<UserAccount> Register(UserAccount account, string password);
        Task<UserAccount> Login(string username, string password);
        Task<bool> UserExists(string username, int userId = 0);
        EncryptedPassword GenerateNewPassword(string password);
        RefreshToken GenerateNewRefreshToken();
        Task RemoveExpiredRefreshTokens();
        Task<List<UserAccount>> GetAllSalesAgents();
        Task<UserPermission> GetCurrentUsersPermissionLevel(int userId, ModulesEnum moduleId);
    }
}
