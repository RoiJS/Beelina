using Beelina.LIB.Enums;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IGeneralSettingRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<GeneralSetting> GetGeneralSettings();
    }
}
