using Beelina.LIB.Enums;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface ITransactionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<List<CustomerSale>> GetTopCustomerSales(int storeId, string fromDate, string toDate);
        Task<List<CustomerSaleProduct>> GetTopCustomerSaleProducts(int storeId);
        Task<Transaction> RegisterTransaction(Transaction transaction, List<ProductTransaction> deletedProductTransactions, CancellationToken cancellationToken = default);
        Task<TransactionDetails> GetTransaction(int transactionId);
        Task<bool> SendTransactionEmailReceipt(int transactionId);
        Task<List<TransactionDateInformation>> GetTransactonDates(TransactionStatusEnum status, string fromDate, string toDate);
        Task<List<TransactionInformation>> GetTransactionsByDate(TransactionStatusEnum status, string transactionDate);
        Task<TransactionSales> GetSales(int userId, string fromDate, string toDate);
        Task<double> GetBadOrderAmount(string transactionNo, int storeId);
        Task<List<TotalSalesPerDateRange>> GetTotalSalePerDateRange(int userId, List<DateRange> dateRanges);
        Task<List<TransactionSalesPerSalesAgent>> GetSalesForAllSalesAgent(string fromDate, string toDate);
        Task DeleteOrderTransactions(List<int> transactionIds);
    }
}
