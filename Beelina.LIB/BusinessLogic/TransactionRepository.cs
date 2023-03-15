using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class TransactionRepository
        : BaseRepository<Transaction>, ITransactionRepository<Transaction>
    {

        public TransactionRepository(IBeelinaRepository<Transaction> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }

        public async Task<TransactionSales> GetSales(string fromDate, string toDate)
        {
            var transactionSales = (from t in _beelinaRepository.ClientDbContext.Transactions
                                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                    on t.Id equals pt.TransactionId

                                    select new
                                    {
                                        Transaction = t,
                                        ProductTransaction = pt
                                    });

            if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
            {
                transactionSales = transactionSales.Where(t => t.Transaction.TransactionDate >= Convert.ToDateTime(fromDate) && t.Transaction.TransactionDate <= Convert.ToDateTime(toDate));
            }

            return new TransactionSales { Sales = await transactionSales.SumAsync(t => t.ProductTransaction.Price * t.ProductTransaction.Quantity) };
        }

        public async Task<List<Transaction>> GetTransactionByDate(string transactionDate)
        {
            var transactionsFromRepo = await _beelinaRepository.ClientDbContext.Transactions
                                        .Include(t => t.Store)
                                        .Include(t => t.ProductTransactions)
                                        .Where(t => t.TransactionDate.Date == Convert.ToDateTime(transactionDate))
                                        .ToListAsync();

            return transactionsFromRepo;
        }

        public async Task<List<TransactionHistoryDate>> GetTransactonDates(string transactionDate)
        {
            var transactions = await (
                    from t in _beelinaRepository.ClientDbContext.Transactions
                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                    on t.Id equals pt.TransactionId

                    select new
                    {
                        Transactions = t,
                        ProductTransactions = pt
                    }
                ).ToListAsync();

            var transactionHistoryDates = (from t in transactions
                                           group t by t.Transactions.TransactionDate into g

                                           select new TransactionHistoryDate
                                           {
                                               TransactionDate = g.Key,
                                               AllTransactionsPaid = Convert.ToBoolean(g.Max(s => s.ProductTransactions.Status))
                                           });

            if (!String.IsNullOrEmpty(transactionDate))
            {
                transactionHistoryDates = transactionHistoryDates.Where(t => t.TransactionDate == Convert.ToDateTime(transactionDate));
            }
            return transactionHistoryDates.ToList();
        }

        public async Task<Transaction> RegisterTransaction(Transaction transaction)
        {
            if (transaction.Id <= 0)
                await AddEntity(transaction);
            else
                await SaveChanges();

            return transaction;
        }
    }
}
