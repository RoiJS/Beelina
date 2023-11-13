using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class TransactionRepository
        : BaseRepository<Transaction>, ITransactionRepository<Transaction>
    {
        private readonly ICurrentUserService currentUserService;

        public TransactionRepository(IBeelinaRepository<Transaction> beelinaRepository, ICurrentUserService currentUserService)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            this.currentUserService = currentUserService;
        }

        public async Task<TransactionSales> GetSales(string fromDate, string toDate)
        {
            var transactionSales = (from t in _beelinaRepository.ClientDbContext.Transactions
                                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                    on t.Id equals pt.TransactionId

                                    where
                                        t.Status == TransactionStatusEnum.Confirmed
                                        && t.CreatedById == currentUserService.CurrentUserId

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

        public async Task<List<Transaction>> GetTransactionByDate(TransactionStatusEnum status, string transactionDate)
        {
            var transactionsFromRepo = await _beelinaRepository.ClientDbContext.Transactions
                                        .Include(t => t.Store)
                                        .Include(t => t.ProductTransactions)
                                        .Where(t =>
                                            t.TransactionDate.Date == Convert.ToDateTime(transactionDate)
                                            && t.Status == status
                                            && t.CreatedById == currentUserService.CurrentUserId)
                                        .ToListAsync();

            return transactionsFromRepo;
        }

        public async Task<List<TransactionDateInformation>> GetTransactonDates(TransactionStatusEnum status, string fromDate, string toDate)
        {
            var transactions = await (
                    from t in _beelinaRepository.ClientDbContext.Transactions
                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                    on t.Id equals pt.TransactionId

                    where t.Status == status && t.CreatedById == currentUserService.CurrentUserId

                    select new
                    {
                        Transactions = t,
                        ProductTransactions = pt
                    }
                ).ToListAsync();


            var unpaidTransactionHistoryDates = (from t in transactions
                                                 group t by new { t.Transactions.TransactionDate, t.ProductTransactions.TransactionId } into g

                                                 select new TransactionDateInformation
                                                 {
                                                     TransactionDate = g.Key.TransactionDate,
                                                     NumberOfUnPaidTransactions = Convert.ToInt32(g.Min(s => s.ProductTransactions.Status)),
                                                     AllTransactionsPaid = Convert.ToBoolean(g.Min(s => s.ProductTransactions.Status))
                                                 });

            var transactionHistoryDates = (from t in unpaidTransactionHistoryDates
                                           group t by new { t.TransactionDate } into g

                                           select new TransactionDateInformation
                                           {
                                               TransactionDate = g.Key.TransactionDate,
                                               NumberOfUnPaidTransactions = g.Count(s => s.NumberOfUnPaidTransactions == 0),
                                               AllTransactionsPaid = Convert.ToBoolean(g.Min(s => s.AllTransactionsPaid))
                                           });

            if (!String.IsNullOrEmpty(fromDate) || !String.IsNullOrEmpty(toDate))
            {
                if (!String.IsNullOrEmpty(fromDate))
                {
                    transactionHistoryDates = transactionHistoryDates.Where(t => t.TransactionDate >= Convert.ToDateTime(fromDate));
                }

                if (!String.IsNullOrEmpty(toDate))
                {
                    transactionHistoryDates = transactionHistoryDates.Where(t => t.TransactionDate <= Convert.ToDateTime(toDate));
                }
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
