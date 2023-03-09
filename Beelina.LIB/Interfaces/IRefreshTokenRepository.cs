using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IRefreshTokenRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<RefreshToken> GetRefreshToken(string refreshToken);
    }
}