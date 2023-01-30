using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IStoreRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Store> RegisterStore(Store store);
    }
}
