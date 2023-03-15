using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface ITransactionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Transaction> RegisterTransaction(Transaction transaction);

        Task<List<TransactionHistoryDate>> GetTransactonDates(string transactionDate);

        Task<List<Transaction>> GetTransactionByDate(string transactionDate);
        
        Task<TransactionSales> GetSales(string fromDate, string toDate);
    }
}
