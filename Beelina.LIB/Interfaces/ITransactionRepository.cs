using Beelina.LIB.Enums;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface ITransactionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Transaction> RegisterTransaction(Transaction transaction);

        Task<List<TransactionDateInformation>> GetTransactonDates(TransactionStatusEnum status, string fromDate, string toDate);

        Task<List<TransactionInformation>> GetTransactionsByDate(TransactionStatusEnum status, string transactionDate);

        Task<TransactionSales> GetSales(int userId, string fromDate, string toDate);

        Task<double> GetBadOrderAmount(string transactionNo, int storeId);

        Task<List<TotalSalesPerDateRange>> GetTotalSalePerDateRange(int userId, List<DateRange> dateRanges);

        Task<List<TransactionSalesPerSalesAgent>> GetSalesForAllSalesAgent(string fromDate, string toDate);
        Task DeleteOrderTransactions(List<int> transactionIds);
    }
}
