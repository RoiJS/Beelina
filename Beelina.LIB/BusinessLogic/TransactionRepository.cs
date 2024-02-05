using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class TransactionRepository
        : BaseRepository<Transaction>, ITransactionRepository<Transaction>
    {
        private readonly IUserAccountRepository<UserAccount> _userAccountRepository;
        private readonly ICurrentUserService _currentUserService;

        public TransactionRepository(
            IBeelinaRepository<Transaction> beelinaRepository,
            IUserAccountRepository<UserAccount> userAccountRepository,
            ICurrentUserService currentUserService
        )
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            _userAccountRepository = userAccountRepository;
            _currentUserService = currentUserService;
        }

        public async Task<List<TotalSalesPerDateRange>> GetTotalSalePerDateRange(int userId, List<DateRange> dateRanges)
        {
            var totalSalePerDateRanges = new List<TotalSalesPerDateRange>();

            foreach (var dateRange in dateRanges)
            {
                var salesAgentSales = await GetSales(userId, dateRange.FromDate, dateRange.ToDate);
                var dateRangeSales = new TotalSalesPerDateRange
                {
                    TotalSales = salesAgentSales.Sales,
                    FromDate = dateRange.FromDate,
                    ToDate = dateRange.ToDate,
                    Label = dateRange.Label
                };

                totalSalePerDateRanges.Add(dateRangeSales);
            }

            return totalSalePerDateRanges;
        }

        public async Task<TransactionSales> GetSales(int userId, string fromDate, string toDate)
        {
            var confirmedOrdersAmount = await GetOrdersAmount(TransactionStatusEnum.Confirmed, userId, fromDate, toDate);
            var badOrdersAmount = await GetOrdersAmount(TransactionStatusEnum.BadOrder, userId, fromDate, toDate);

            return new TransactionSales { Sales = confirmedOrdersAmount.Sales - badOrdersAmount.Sales };
        }

        public async Task<List<TransactionSalesPerSalesAgent>> GetSalesForAllSalesAgent(string fromDate, string toDate)
        {
            var salesAgents = await _userAccountRepository.GetAllSalesAgents();
            var salesPerSalesAgent = new List<TransactionSalesPerSalesAgent>();
            foreach (var salesAgent in salesAgents)
            {
                var sales = new TransactionSalesPerSalesAgent();
                var confirmedOrdersAmount = await GetOrdersAmount(TransactionStatusEnum.Confirmed, salesAgent.Id, fromDate, toDate);
                var badOrdersAmount = await GetOrdersAmount(TransactionStatusEnum.BadOrder, salesAgent.Id, fromDate, toDate);

                sales.Id = salesAgent.Id;
                sales.SalesAgentName = salesAgent.PersonFullName;
                sales.Sales = confirmedOrdersAmount.Sales - badOrdersAmount.Sales;

                salesPerSalesAgent.Add(sales);
            }
            return salesPerSalesAgent;
        }

        public async Task<List<TransactionInformation>> GetTransactionsByDate(TransactionStatusEnum status, string transactionDate)
        {
            var transactions = await (
                    from t in _beelinaRepository.ClientDbContext.Transactions

                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                    on t.Id equals pt.TransactionId

                    join s in _beelinaRepository.ClientDbContext.Stores
                    on t.StoreId equals s.Id

                    where
                        t.TransactionDate == Convert.ToDateTime(transactionDate)
                        && t.Status == status
                        && t.IsDelete == false
                        && t.IsActive
                        && t.CreatedById == _currentUserService.CurrentUserId

                    select new
                    {
                        Id = t.Id,
                        InvoiceNo = t.InvoiceNo,
                        StoreId = s.Id,
                        StoreName = s.Name,
                        TransactionDate = t.TransactionDate,
                        ProductTransactions = pt
                    }
                ).ToListAsync();


            var transactionsWithPaymentStatus = (from t in transactions
                                                 group t by new { t.Id, t.InvoiceNo, t.StoreId, t.StoreName, t.TransactionDate } into g
                                                 select new TransactionInformation
                                                 {
                                                     Id = g.Key.Id,
                                                     InvoiceNo = g.Key.InvoiceNo,
                                                     StoreId = g.Key.StoreId,
                                                     StoreName = g.Key.StoreName,
                                                     TransactionDate = g.Key.TransactionDate,
                                                     HasUnpaidProductTransaction = Convert.ToInt32(g.Min(s => s.ProductTransactions.Status)) == 0
                                                 })
                                                .ToList();

            return transactionsWithPaymentStatus;
        }

        public async Task<List<TransactionDateInformation>> GetTransactonDates(TransactionStatusEnum status, string fromDate, string toDate)
        {
            var transactions = await (
                    from t in _beelinaRepository.ClientDbContext.Transactions
                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                    on t.Id equals pt.TransactionId

                    where
                        t.Status == status
                        && t.IsDelete == false
                        && t.IsActive
                        && t.CreatedById == _currentUserService.CurrentUserId

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

        public async Task<double> GetBadOrderAmount(string transactionNo, int storeId)
        {
            var badOrdersFromRepo = (from t in _beelinaRepository.ClientDbContext.Transactions
                                     join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                     on t.Id equals pt.TransactionId

                                     where
                                         t.Status == TransactionStatusEnum.BadOrder
                                         && t.CreatedById == _currentUserService.CurrentUserId
                                         && t.IsDelete == false
                                         && t.IsActive == true
                                         && t.StoreId == storeId
                                         && t.InvoiceNo == transactionNo

                                     select new
                                     {
                                         Transaction = t,
                                         ProductTransaction = pt
                                     });

            var salesPerBadOrder = badOrdersFromRepo
                       .GroupBy(
                           t => new { t.Transaction.Id, t.Transaction.Discount }
                       ).Select(p => new
                       {
                           TransactionId = p.Key.Id,
                           Discount = p.Key.Discount,
                           TotalAmountPerTransaction = p.Sum(t => t.ProductTransaction.Price * t.ProductTransaction.Quantity)
                       });

            // Calculate Discounted Sales
            var discountedSalesPerBadOrders = await salesPerBadOrder.SumAsync(t => t.TotalAmountPerTransaction - (t.TotalAmountPerTransaction * t.Discount / 100));

            return discountedSalesPerBadOrders;
        }

        private async Task<TransactionSales> GetOrdersAmount(TransactionStatusEnum status, int userId, string fromDate, string toDate)
        {
            var userRetailModulePermission = await _userAccountRepository.GetCurrentUsersPermissionLevel(userId, ModulesEnum.Retail);

            var transactionSales = (from t in _beelinaRepository.ClientDbContext.Transactions
                                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                    on t.Id equals pt.TransactionId

                                    where
                                        t.Status == status
                                        // Get all orders if current user is Manager or Admininistrator
                                        && (
                                            userRetailModulePermission.PermissionLevel > PermissionLevelEnum.User ||
                                            (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User && t.CreatedById == userId)
                                        )
                                        && t.IsDelete == false

                                    select new
                                    {
                                        Transaction = t,
                                        ProductTransaction = pt
                                    });

            if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
            {
                fromDate = Convert.ToDateTime(fromDate).Add(new TimeSpan(0, 0, 0)).ToString("yyyy-MM-dd HH:mm:ss");
                toDate = Convert.ToDateTime(toDate).Add(new TimeSpan(23, 59, 0)).ToString("yyyy-MM-dd HH:mm:ss");

                transactionSales = transactionSales.Where(t =>
                        t.Transaction.TransactionDate >= Convert.ToDateTime(fromDate)
                        && t.Transaction.TransactionDate <= Convert.ToDateTime(toDate)
                );
            }

            // Extract Sales per Transaction
            var salesPerTransactions = transactionSales
                        .GroupBy(
                            t => new { t.Transaction.Id, t.Transaction.Discount }
                        ).Select(p => new
                        {
                            TransactionId = p.Key.Id,
                            Discount = p.Key.Discount,
                            TotalAmountPerTransaction = p.Sum(t => t.ProductTransaction.Price * t.ProductTransaction.Quantity)
                        });

            // Calculate Discounted Sales
            var discountedSalesPerTransactions = await salesPerTransactions.SumAsync(t => t.TotalAmountPerTransaction - (t.TotalAmountPerTransaction * t.Discount / 100));

            return new TransactionSales { Sales = discountedSalesPerTransactions };
        }

        public async Task DeleteOrderTransactions(List<int> transactionIds)
        {
            var transactionsFromRepo = await _beelinaRepository.ClientDbContext.Transactions
                                .Where(t => transactionIds.Contains(t.Id))
                                .ToListAsync();

            DeleteMultipleEntities(transactionsFromRepo);
        }
    }
}
