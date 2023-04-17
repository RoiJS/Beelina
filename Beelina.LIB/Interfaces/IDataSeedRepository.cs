using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IDataSeedRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        void SeedData(Account account, Client client);
    }
}