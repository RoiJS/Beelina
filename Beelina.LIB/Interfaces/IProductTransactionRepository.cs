
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IProductTransactionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<List<ProductTransaction>> GetProductTransactions(int transactionId);
    }
}
