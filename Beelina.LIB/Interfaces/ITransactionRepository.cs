using Beelina.LIB.Enums;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface ITransactionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Transaction> RegisterTransaction(Transaction transaction);

        Task<List<TransactionDateInformation>> GetTransactonDates(TransactionStatusEnum statuse, string fromDate, string toDate);

        Task<List<Transaction>> GetTransactionByDate(TransactionStatusEnum status,string transactionDate);
        
        Task<TransactionSales> GetSales(string fromDate, string toDate);

        Task<double> GetBadOrderAmount(string transactionNo, int storeId);
    }
}
