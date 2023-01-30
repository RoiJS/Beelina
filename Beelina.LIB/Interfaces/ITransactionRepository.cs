using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface ITransactionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Transaction> RegisterTransaction(Transaction transaction);
    }
}
