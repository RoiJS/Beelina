
namespace Beelina.LIB.Interfaces
{
    public interface IProductTransactionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
    }
}
