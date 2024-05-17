
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IProductTransactionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task DeleteProductTransactions(List<ProductTransaction> productTransactions, CancellationToken cancellationToken = default);
        Task<List<ProductTransaction>> GetProductTransactions(int transactionId);
        Task<List<TransactionTopProduct>> GetTopSellingProducts(int userId, string fromDate = "", string toDate = "");
    }
}
