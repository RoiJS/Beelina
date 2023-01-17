using Beelina.LIB.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

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
    }
}
