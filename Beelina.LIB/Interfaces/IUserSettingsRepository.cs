using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IUserSettingsRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<UserSetting> Register(UserSetting userSetting);
        Task<UserSetting> GetUserSettings(int userId);
    }
}
