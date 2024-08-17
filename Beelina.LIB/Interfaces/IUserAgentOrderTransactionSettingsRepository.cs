using Beelina.LIB.Dtos;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IUserAgentOrderTransactionSettingsRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<UserAgentOrderTransactionSettingsDto> GetOrderTransactionSettings(int userId);
        Task<bool> SaveOrderTransactionSettings(UserAgentOrderTransactionSettingInput userAgentOrderTransactionSettingInput);
    }
}
