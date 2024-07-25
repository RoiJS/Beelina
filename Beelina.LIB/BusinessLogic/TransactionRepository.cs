using System.Text;
using Beelina.LIB.Enums;
using Beelina.LIB.Helpers.Class;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ReserbizAPP.LIB.Helpers.Class;
using ReserbizAPP.LIB.Helpers.Services;

namespace Beelina.LIB.BusinessLogic
{
    public class TransactionRepository
        : BaseRepository<Transaction>, ITransactionRepository<Transaction>
    {
        private readonly IUserAccountRepository<UserAccount> _userAccountRepository;
        private readonly IProductTransactionRepository<ProductTransaction> _productTransactionRepository;
        private IOptions<EmailServerSettings> _emailServerSettings { get; }
        private readonly IOptions<AppHostInfo> _appHostInfo;
        private readonly IOptions<ApplicationSettings> _appSettings;
        private readonly ICurrentUserService _currentUserService;

        public TransactionRepository(
            IBeelinaRepository<Transaction> beelinaRepository,
            IUserAccountRepository<UserAccount> userAccountRepository,
            IProductTransactionRepository<ProductTransaction> productTransactionRepository,
            IOptions<EmailServerSettings> emailServerSettings,
            IOptions<AppHostInfo> appHostInfo,
            IOptions<ApplicationSettings> appSettings,
            ICurrentUserService currentUserService
        )
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            _appHostInfo = appHostInfo;
            _appSettings = appSettings;
            _currentUserService = currentUserService;
            _emailServerSettings = emailServerSettings;
            _productTransactionRepository = productTransactionRepository;
            _userAccountRepository = userAccountRepository;
        }

        public async Task<List<CustomerSale>> GetTopCustomerSales(int storeId, string fromDate, string toDate)
        {
            var customerProductTransactions = (from t in _beelinaRepository.ClientDbContext.Transactions

                                               join p in _beelinaRepository.ClientDbContext.ProductTransactions
                                                  on t.Id equals p.TransactionId
                                                  into joinProductTransactions
                                               from pt in joinProductTransactions.DefaultIfEmpty()

                                               join s in _beelinaRepository.ClientDbContext.Stores
                                                  on t.StoreId equals s.Id

                                               where
                                                  (storeId == 0 || (storeId > 0 && t.StoreId == storeId))
                                                  && t.Status == TransactionStatusEnum.Confirmed
                                                  && s.IsActive
                                                  && !s.IsDelete
                                                  && t.IsActive
                                                  && !t.IsDelete

                                               select new
                                               {
                                                   Store = s,
                                                   Transaction = t,
                                                   ProductTransaction = pt
                                               }
                                );

            if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
            {
                fromDate = Convert.ToDateTime(fromDate).Add(new TimeSpan(0, 0, 0)).ToString("yyyy-MM-dd HH:mm:ss");
                toDate = Convert.ToDateTime(toDate).Add(new TimeSpan(23, 59, 0)).ToString("yyyy-MM-dd HH:mm:ss");

                customerProductTransactions = customerProductTransactions.Where(t =>
                        t.Transaction.TransactionDate >= Convert.ToDateTime(fromDate)
                        && t.Transaction.TransactionDate <= Convert.ToDateTime(toDate)
                );
            }

            // (1) Calculate Total sales Per Store
            // ============================================================================================================
            var topCustomerSales = await customerProductTransactions
                .GroupBy(t => new { t.Store.Id, t.Store.Name, t.Store.OutletType })
                .Select(g => new CustomerSale
                {
                    StoreId = g.Key.Id,
                    StoreName = g.Key.Name,
                    OutletType = g.Key.OutletType,
                    TotalSalesAmount = Math.Round(g.Sum(t => t.ProductTransaction.Price * t.ProductTransaction.Quantity), 2),
                })
                .OrderByDescending(t => t.TotalSalesAmount)
                .ToListAsync();

            // (2) Calculate number of transactions per store
            // =============================================================================================================
            var customerTransactions = await customerProductTransactions
            .GroupBy(t => new { t.Store.Id, TransactionId = t.Transaction.Id })
                .Select(g => new
                {
                    StoreId = g.Key.Id,
                    TransactionId = g.Key.TransactionId
                }).ToListAsync();

            var customerPerNumberOfTransactions = customerTransactions
                .GroupBy(t => new { t.StoreId })
                .Select(g => new
                {
                    StoreId = g.Key.StoreId,
                    NumberOfTransactions = g.Count()
                })
                .ToList();

            // (3) Construct final customer sale list
            // ==============================================================================================================
            topCustomerSales = topCustomerSales.Join(
                customerPerNumberOfTransactions,
                customerSales => customerSales.StoreId,
                customerPerNumberOfTransaction => customerPerNumberOfTransaction.StoreId,
                (customerSales, customerPerNumberOfTransaction) => new CustomerSale
                {
                    StoreId = customerSales.StoreId,
                    StoreName = customerSales.StoreName,
                    OutletType = customerSales.OutletType,
                    NumberOfTransactions = customerPerNumberOfTransaction.NumberOfTransactions,
                    TotalSalesAmount = customerSales.TotalSalesAmount,
                }).ToList();

            return topCustomerSales;
        }

        public async Task<List<CustomerSaleProduct>> GetTopCustomerSaleProducts(int storeId)
        {
            var customeTransactions = (from t in _beelinaRepository.ClientDbContext.Transactions

                                       join p in _beelinaRepository.ClientDbContext.ProductTransactions
                                          on t.Id equals p.TransactionId
                                          into joinProductTransactions
                                       from pt in joinProductTransactions.DefaultIfEmpty()

                                       join p in _beelinaRepository.ClientDbContext.Products
                                          on pt.ProductId equals p.Id
                                          into joinProducts
                                       from pp in joinProducts.DefaultIfEmpty()

                                       join pu in _beelinaRepository.ClientDbContext.ProductUnits
                                            on pp.ProductUnitId equals pu.Id

                                       where
                                          t.StoreId == storeId
                                          && pp.IsActive
                                          && !pp.IsDelete
                                          && t.IsActive
                                          && !t.IsDelete

                                       select new
                                       {
                                           Product = pp,
                                           ProductUnitName = pu.Name,
                                           Transaction = t,
                                           ProductTransaction = pt
                                       }
                                );

            var topCustomerSalesProducts = await customeTransactions
                .GroupBy(t => new { t.Product.Code, t.Product.Id, t.Product.Name, t.ProductUnitName })
                .Select(g => new CustomerSaleProduct
                {
                    ProductId = g.Key.Id,
                    ProductCode = g.Key.Code,
                    ProductName = g.Key.Name,
                    Unit = g.Key.ProductUnitName,
                    TotalSalesAmount = Math.Round(g.Sum(t => t.ProductTransaction.Price * t.ProductTransaction.Quantity), 2),
                })
                .OrderByDescending(t => t.TotalSalesAmount)
                .ToListAsync();

            return topCustomerSalesProducts;
        }

        public async Task<List<TotalSalesPerDateRange>> GetTotalSalePerDateRange(int userId, List<DateRange> dateRanges)
        {
            var totalSalePerDateRanges = new List<TotalSalesPerDateRange>();

            foreach (var dateRange in dateRanges)
            {
                var salesAgentSales = await GetSales(userId, dateRange.FromDate, dateRange.ToDate);
                var dateRangeSales = new TotalSalesPerDateRange
                {
                    TotalSales = salesAgentSales.TotalSalesAmount,
                    ChequeAmountOnHand = salesAgentSales.ChequeAmountOnHand,
                    CashAmountOnHand = salesAgentSales.CashAmountOnHand,
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
            var chequeOnHandAmount = await GetOrderPayments(TransactionStatusEnum.Confirmed, ModeOfPaymentEnum.Cheque, userId, fromDate, toDate);
            var cashOnHandAmount = await GetOrderPayments(TransactionStatusEnum.Confirmed, ModeOfPaymentEnum.Cash, userId, fromDate, toDate);

            return new TransactionSales
            {
                TotalSalesAmount = confirmedOrdersAmount.TotalSalesAmount,
                ChequeAmountOnHand = chequeOnHandAmount.TotalSalesAmount,
                CashAmountOnHand = cashOnHandAmount.TotalSalesAmount
            };
        }

        public async Task<List<TransactionSalesPerSalesAgent>> GetSalesForAllSalesAgent(string fromDate, string toDate)
        {
            var salesAgents = await _userAccountRepository.GetAllSalesAgents();
            var salesPerSalesAgent = new List<TransactionSalesPerSalesAgent>();
            foreach (var salesAgent in salesAgents)
            {
                var sales = new TransactionSalesPerSalesAgent();
                var confirmedOrdersAmount = await GetOrdersAmount(TransactionStatusEnum.Confirmed, salesAgent.Id, fromDate, toDate);
                var chequeOnHandAmount = await GetOrderPayments(TransactionStatusEnum.Confirmed, ModeOfPaymentEnum.Cheque, salesAgent.Id, fromDate, toDate);
                var cashOnHandAmount = await GetOrderPayments(TransactionStatusEnum.Confirmed, ModeOfPaymentEnum.Cash, salesAgent.Id, fromDate, toDate);

                sales.Id = salesAgent.Id;
                sales.SalesAgentName = salesAgent.PersonFullName;
                sales.Sales = confirmedOrdersAmount.TotalSalesAmount;
                sales.ChequeAmountOnHand = chequeOnHandAmount.TotalSalesAmount;
                sales.CashAmountOnHand = cashOnHandAmount.TotalSalesAmount;

                salesPerSalesAgent.Add(sales);
            }
            return salesPerSalesAgent;
        }

        public async Task<List<TransactionInformation>> GetTransactionsByDate(TransactionStatusEnum status, string transactionDate)
        {
            var transactionsFilter = new TransactionsFilter
            {
                Status = status,
                TransactionDate = transactionDate
            };
            return await GetTransactions(_currentUserService.CurrentUserId, "", transactionsFilter);
        }

        public async Task<List<TransactionInformation>> GetTransactions(int userId, string filterKeyword = "", TransactionsFilter transactionsFilter = null)
        {
            var transactions = await (
                    from t in _beelinaRepository.ClientDbContext.Transactions

                    join u in _beelinaRepository.ClientDbContext.UserAccounts
                    on t.CreatedById equals u.Id
                    into transactionCreatedJoin
                    from uc in transactionCreatedJoin.DefaultIfEmpty()

                    join uu in _beelinaRepository.ClientDbContext.UserAccounts
                    on t.UpdatedById equals uu.Id
                    into transactionUpdatedJoin
                    from up in transactionUpdatedJoin.DefaultIfEmpty()

                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                    on t.Id equals pt.TransactionId

                    join s in _beelinaRepository.ClientDbContext.Stores
                    on t.StoreId equals s.Id

                    join b in _beelinaRepository.ClientDbContext.Barangays
                    on s.BarangayId equals b.Id

                    where
                        (transactionsFilter.Status == TransactionStatusEnum.All || (transactionsFilter.Status != TransactionStatusEnum.All && t.Status == transactionsFilter.Status))
                        && (userId == 0 || (userId > 0 && t.CreatedById == userId))
                        && (transactionsFilter == null || (transactionsFilter != null && ((String.IsNullOrEmpty(transactionsFilter.TransactionDate) || (!String.IsNullOrEmpty(transactionsFilter.TransactionDate) && t.TransactionDate == Convert.ToDateTime(transactionsFilter.TransactionDate))))))
                        && !t.IsDelete
                        && t.IsActive

                    select new
                    {
                        Id = t.Id,
                        InvoiceNo = t.InvoiceNo ?? String.Empty,
                        Status = t.Status,
                        CreatedById = t.CreatedById,
                        CreatedBy = uc.PersonFullName ?? String.Empty,
                        StoreId = s.Id,
                        StoreName = s.Name ?? String.Empty,
                        BarangayName = b.Name ?? String.Empty,
                        TransactionDate = t.TransactionDate,
                        ProductTransaction = pt,
                        DateUpdated = t.DateUpdated,
                        UpdatedBy = up.PersonFullName ?? String.Empty,
                    }
                ).ToListAsync();


            transactions = (from t in transactions

                            where (String.IsNullOrEmpty(filterKeyword) || (!String.IsNullOrEmpty(filterKeyword) && (t.InvoiceNo.IsMatchAnyKeywords(filterKeyword) || t.StoreName.IsMatchAnyKeywords(filterKeyword) || t.BarangayName.IsMatchAnyKeywords(filterKeyword) || t.CreatedBy.IsMatchAnyKeywords(filterKeyword))))

                            select new
                            {
                                Id = t.Id,
                                InvoiceNo = t.InvoiceNo,
                                Status = t.Status,
                                CreatedById = t.CreatedById,
                                CreatedBy = t.CreatedBy,
                                StoreId = t.StoreId,
                                StoreName = t.StoreName,
                                BarangayName = t.BarangayName,
                                TransactionDate = t.TransactionDate,
                                ProductTransaction = t.ProductTransaction,
                                DateUpdated = t.DateUpdated,
                                UpdatedBy = t.UpdatedBy,
                            }).ToList();



            var transactionsWithPaymentStatus = (from t in transactions
                                                 group t by new
                                                 {
                                                     t.Id,
                                                     t.InvoiceNo,
                                                     t.StoreId,
                                                     t.StoreName,
                                                     t.BarangayName,
                                                     t.CreatedBy,
                                                     t.TransactionDate,
                                                     t.Status,
                                                     t.CreatedById,
                                                     t.DateUpdated,
                                                     t.UpdatedBy
                                                 } into g
                                                 select new TransactionInformation
                                                 {
                                                     Id = g.Key.Id,
                                                     InvoiceNo = g.Key.InvoiceNo,
                                                     CreatedById = g.Key.CreatedById,
                                                     CreatedBy = g.Key.CreatedBy,
                                                     Status = g.Key.Status,
                                                     StoreId = g.Key.StoreId,
                                                     StoreName = g.Key.StoreName,
                                                     BarangayName = g.Key.BarangayName,
                                                     TransactionDate = g.Key.TransactionDate,
                                                     HasUnpaidProductTransaction = Convert.ToInt32(g.Min(s => s.ProductTransaction.Status)) == 0,
                                                     OrderItemsDateUpdated = g.Max(s => s.ProductTransaction.DateUpdated.ConvertToTimeZone(_appSettings.Value.GeneralSettings.TimeZone)),
                                                     DetailsDateUpdated = g.Key.DateUpdated.ConvertToTimeZone(_appSettings.Value.GeneralSettings.TimeZone),
                                                     DetailsUpdatedBy = g.Key.UpdatedBy,
                                                 })
                                                .OrderByDescending(t => t.TransactionDate)
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

        public async Task<TransactionDetails> GetTransaction(int transactionId)
        {
            var badOrdersAmount = 0.0;
            var transactionFromRepo = await GetEntity(transactionId)
                            .Includes(
                                t => t.Payments,
                                t => t.Store,
                                t => t.Store.Barangay,
                                t => t.Store.PaymentMethod
                            )
                            .ToObjectAsync();

            if (transactionFromRepo == null)
            {
                return new TransactionDetails { Transaction = null, BadOrderAmount = badOrdersAmount };
            }

            // Only get for bad order amount if the transaction status is confirmed
            if (transactionFromRepo.Status == TransactionStatusEnum.Confirmed)
            {
                badOrdersAmount = await GetBadOrderAmount(transactionFromRepo.InvoiceNo, transactionFromRepo.StoreId);
            }

            transactionFromRepo.BadOrderAmount = badOrdersAmount;
            transactionFromRepo.ProductTransactions = await _productTransactionRepository.GetProductTransactions(transactionId);

            return new TransactionDetails { Transaction = transactionFromRepo, BadOrderAmount = badOrdersAmount };
        }

        public async Task<Transaction> RegisterTransaction(Transaction transaction, List<ProductTransaction> deletedProductTransactions, CancellationToken cancellationToken = default)
        {
            if (transaction.Id <= 0)
                await AddEntity(transaction);
            else
            {
                if (deletedProductTransactions.Count > 0)
                {
                    await _productTransactionRepository.DeleteProductTransactions(deletedProductTransactions, cancellationToken);
                }

                await SaveChanges(cancellationToken);
            }

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

        private async Task<TransactionSales> GetOrderPayments(TransactionStatusEnum status, ModeOfPaymentEnum paymentMethod, int userId, string fromDate, string toDate)
        {
            var discountedSalesPerTransactions = 0.0;
            var userRetailModulePermission = await _userAccountRepository.GetCurrentUsersPermissionLevel(userId, ModulesEnum.Distribution);

            var transactionSales = (from t in _beelinaRepository.ClientDbContext.Transactions
                                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                    on t.Id equals pt.TransactionId

                                    where
                                        t.Status == status
                                        && t.ModeOfPayment == (int)paymentMethod
                                        // Get all orders if current user is Manager or Admininistrator
                                        && (
                                            userRetailModulePermission.PermissionLevel > PermissionLevelEnum.User ||
                                            (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User && t.CreatedById == userId)
                                        )
                                        && t.IsDelete == false
                                        && t.IsActive
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
                            t => new { t.Transaction.Id, t.Transaction.InvoiceNo, t.Transaction.StoreId, t.Transaction.Discount }
                        ).Select(p => new
                        {
                            TransactionId = p.Key.Id,
                            InvoiceNo = p.Key.InvoiceNo,
                            StoreId = p.Key.StoreId,
                            Discount = p.Key.Discount,
                            TotalAmountPerTransaction = p.Sum(t => t.ProductTransaction.Price * t.ProductTransaction.Quantity)
                        });


            if (status == TransactionStatusEnum.Confirmed)
            {
                var salesPerTransactionsDiscounted = await salesPerTransactions
                                    .GroupBy(
                                        t => new { t.TransactionId, t.InvoiceNo, t.StoreId }
                                    ).Select(p => new
                                    {
                                        TransactionId = p.Key.TransactionId,
                                        InvoiceNo = p.Key.InvoiceNo,
                                        StoreId = p.Key.StoreId,
                                        TotalDiscountedAmountPerTransaction = p.Sum(t => t.TotalAmountPerTransaction - (t.TotalAmountPerTransaction * t.Discount / 100))
                                    }).ToListAsync();

                var badOrders = (from t in _beelinaRepository.ClientDbContext.Transactions
                                 join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                 on t.Id equals pt.TransactionId

                                 join s in _beelinaRepository.ClientDbContext.Stores
                                 on t.StoreId equals s.Id

                                 where
                                     t.Status == TransactionStatusEnum.BadOrder
                                     // Get all orders if current user is Manager or Admininistrator
                                     && (
                                         userRetailModulePermission.PermissionLevel > PermissionLevelEnum.User ||
                                         (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User && t.CreatedById == userId)
                                     )
                                     && t.IsDelete == false

                                 select new
                                 {
                                     Transaction = t,
                                     Store = s,
                                     ProductTransaction = pt
                                 });

                if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
                {
                    fromDate = Convert.ToDateTime(fromDate).Add(new TimeSpan(0, 0, 0)).ToString("yyyy-MM-dd HH:mm:ss");
                    toDate = Convert.ToDateTime(toDate).Add(new TimeSpan(23, 59, 0)).ToString("yyyy-MM-dd HH:mm:ss");

                    badOrders = badOrders.Where(t =>
                            t.Transaction.TransactionDate >= Convert.ToDateTime(fromDate)
                            && t.Transaction.TransactionDate <= Convert.ToDateTime(toDate)
                    );
                }

                // Extract Sales per Transaction
                var salesPerBadOrders = badOrders
                            .GroupBy(
                                t => new { t.Transaction.Id, t.Transaction.InvoiceNo, t.Transaction.StoreId, t.Transaction.Discount }
                            ).Select(p => new
                            {
                                TransactionId = p.Key.Id,
                                InvoiceNo = p.Key.InvoiceNo,
                                StoreId = p.Key.StoreId,
                                Discount = p.Key.Discount,
                                TotalAmountPerTransaction = p.Sum(t => t.ProductTransaction.Price * t.ProductTransaction.Quantity)
                            });

                var salesPerBadOrdersDiscounted = await salesPerBadOrders
                        .GroupBy(
                            t => new { t.TransactionId, t.InvoiceNo, t.StoreId }
                        ).Select(p => new
                        {
                            TransactionId = p.Key.TransactionId,
                            InvoiceNo = p.Key.InvoiceNo,
                            StoreId = p.Key.StoreId,
                            TotalDiscountedAmountPerTransaction = p.Sum(t => t.TotalAmountPerTransaction - (t.TotalAmountPerTransaction * t.Discount / 100))
                        }).ToListAsync();

                var joinedOrders = from s in salesPerTransactionsDiscounted
                                   join b in salesPerBadOrdersDiscounted

                                   on new { InvoiceNo = s.InvoiceNo, StoreId = s.StoreId } equals new { InvoiceNo = b.InvoiceNo, StoreId = b.StoreId }
                                   into ordersJoin
                                   from oj in ordersJoin.DefaultIfEmpty()

                                   select new
                                   {
                                       TotalAmountPerTransaction = oj == null ? s.TotalDiscountedAmountPerTransaction : s.TotalDiscountedAmountPerTransaction - oj.TotalDiscountedAmountPerTransaction
                                   };

                discountedSalesPerTransactions = joinedOrders.Sum(t => t.TotalAmountPerTransaction);

                return new TransactionSales { TotalSalesAmount = discountedSalesPerTransactions };
            }

            // Calculate Discounted Sales
            discountedSalesPerTransactions = await salesPerTransactions.SumAsync(t => t.TotalAmountPerTransaction - (t.TotalAmountPerTransaction * t.Discount / 100));

            return new TransactionSales { TotalSalesAmount = discountedSalesPerTransactions };
        }

        private async Task<TransactionSales> GetOrdersAmount(TransactionStatusEnum status, int userId, string fromDate, string toDate)
        {
            var discountedSalesPerTransactions = 0.0;
            var userRetailModulePermission = await _userAccountRepository.GetCurrentUsersPermissionLevel(userId, ModulesEnum.Distribution);

            var transactionSales = (from t in _beelinaRepository.ClientDbContext.Transactions
                                    join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                    on t.Id equals pt.TransactionId

                                    join s in _beelinaRepository.ClientDbContext.Stores
                                    on t.StoreId equals s.Id

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
                                        Store = s,
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
                            t => new { t.Transaction.Id, t.Transaction.InvoiceNo, t.Transaction.StoreId, t.Transaction.Discount }
                        ).Select(p => new
                        {
                            TransactionId = p.Key.Id,
                            InvoiceNo = p.Key.InvoiceNo,
                            StoreId = p.Key.StoreId,
                            Discount = p.Key.Discount,
                            TotalAmountPerTransaction = p.Sum(t => t.ProductTransaction.Price * t.ProductTransaction.Quantity)
                        });

            if (status == TransactionStatusEnum.Confirmed)
            {
                var salesPerTransactionsDiscounted = await salesPerTransactions
                                    .GroupBy(
                                        t => new { t.TransactionId, t.InvoiceNo, t.StoreId }
                                    ).Select(p => new
                                    {
                                        TransactionId = p.Key.TransactionId,
                                        InvoiceNo = p.Key.InvoiceNo,
                                        StoreId = p.Key.StoreId,
                                        TotalDiscountedAmountPerTransaction = p.Sum(t => t.TotalAmountPerTransaction - (t.TotalAmountPerTransaction * t.Discount / 100))
                                    }).ToListAsync();

                var badOrders = (from t in _beelinaRepository.ClientDbContext.Transactions
                                 join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                 on t.Id equals pt.TransactionId

                                 join s in _beelinaRepository.ClientDbContext.Stores
                                 on t.StoreId equals s.Id

                                 where
                                     t.Status == TransactionStatusEnum.BadOrder
                                     // Get all orders if current user is Manager or Admininistrator
                                     && (
                                         userRetailModulePermission.PermissionLevel > PermissionLevelEnum.User ||
                                         (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User && t.CreatedById == userId)
                                     )
                                     && t.IsDelete == false

                                 select new
                                 {
                                     Transaction = t,
                                     Store = s,
                                     ProductTransaction = pt
                                 });

                if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
                {
                    fromDate = Convert.ToDateTime(fromDate).Add(new TimeSpan(0, 0, 0)).ToString("yyyy-MM-dd HH:mm:ss");
                    toDate = Convert.ToDateTime(toDate).Add(new TimeSpan(23, 59, 0)).ToString("yyyy-MM-dd HH:mm:ss");

                    badOrders = badOrders.Where(t =>
                            t.Transaction.TransactionDate >= Convert.ToDateTime(fromDate)
                            && t.Transaction.TransactionDate <= Convert.ToDateTime(toDate)
                    );
                }

                // Extract Sales per Transaction
                var salesPerBadOrders = badOrders
                            .GroupBy(
                                t => new { t.Transaction.Id, t.Transaction.InvoiceNo, t.Transaction.StoreId, t.Transaction.Discount }
                            ).Select(p => new
                            {
                                TransactionId = p.Key.Id,
                                InvoiceNo = p.Key.InvoiceNo,
                                StoreId = p.Key.StoreId,
                                Discount = p.Key.Discount,
                                TotalAmountPerTransaction = p.Sum(t => t.ProductTransaction.Price * t.ProductTransaction.Quantity)
                            });

                var salesPerBadOrdersDiscounted = await salesPerBadOrders
                        .GroupBy(
                            t => new { t.TransactionId, t.InvoiceNo, t.StoreId }
                        ).Select(p => new
                        {
                            TransactionId = p.Key.TransactionId,
                            InvoiceNo = p.Key.InvoiceNo,
                            StoreId = p.Key.StoreId,
                            TotalDiscountedAmountPerTransaction = p.Sum(t => t.TotalAmountPerTransaction - (t.TotalAmountPerTransaction * t.Discount / 100))
                        }).ToListAsync();

                var joinedOrders = from s in salesPerTransactionsDiscounted
                                   join b in salesPerBadOrdersDiscounted

                                   on new { InvoiceNo = s.InvoiceNo, StoreId = s.StoreId } equals new { InvoiceNo = b.InvoiceNo, StoreId = b.StoreId }
                                   into ordersJoin
                                   from oj in ordersJoin.DefaultIfEmpty()

                                   select new
                                   {
                                       TotalAmountPerTransaction = oj == null ? s.TotalDiscountedAmountPerTransaction : s.TotalDiscountedAmountPerTransaction - oj.TotalDiscountedAmountPerTransaction
                                   };

                discountedSalesPerTransactions = joinedOrders.Sum(t => t.TotalAmountPerTransaction);

                return new TransactionSales { TotalSalesAmount = discountedSalesPerTransactions };
            }

            // Calculate Discounted Sales
            discountedSalesPerTransactions = await salesPerTransactions.SumAsync(t => t.TotalAmountPerTransaction - (t.TotalAmountPerTransaction * t.Discount / 100));

            return new TransactionSales { TotalSalesAmount = discountedSalesPerTransactions };
        }

        public async Task DeleteOrderTransactions(List<int> transactionIds)
        {
            var transactionsFromRepo = await _beelinaRepository.ClientDbContext.Transactions
                                .Where(t => transactionIds.Contains(t.Id))
                                .ToListAsync();

            DeleteMultipleEntities(transactionsFromRepo);
        }

        public async Task<List<Transaction>> MarkTransactionsAsPaid(List<int> transactionIds, bool paid)
        {
            var transactionsFromRepo = await _beelinaRepository.ClientDbContext.Transactions
                                .Where(t => transactionIds.Contains(t.Id))
                                .Includes(t => t.ProductTransactions)
                                .ToListAsync();

            // var transactionFromRepo = await transactionRepository.GetEntity(transactionId).Includes(t => t.ProductTransactions).ToObjectAsync();

            SetCurrentUserId(_currentUserService.CurrentUserId);

            transactionsFromRepo.ForEach(t => t.ProductTransactions.ForEach(p => p.Status = !paid ? PaymentStatusEnum.Unpaid : PaymentStatusEnum.Paid));

            // transactionFromRepo.ProductTransactions.ForEach(p => p.Status = !paid ? PaymentStatusEnum.Unpaid : PaymentStatusEnum.Paid);

            await SaveChanges();

            return transactionsFromRepo;
        }

        public async Task<bool> SendTransactionEmailReceipt(int transactionId)
        {
            var emailService = new EmailService(_emailServerSettings.Value.SmtpServer,
                                _emailServerSettings.Value.SmtpAddress,
                                _emailServerSettings.Value.SmtpPassword,
                                _emailServerSettings.Value.SmtpPort);

            try
            {
                var transactionDetails = await GetTransaction(transactionId);
                var template = await GenerateEmailReceiptTemplate(transactionDetails);
                var subject = $"Bizual Order Transaction Receipt - {transactionDetails.Transaction.InvoiceNo}";
                var salesAgent = transactionDetails.Transaction.Store.EmailAddress;
                var receivers = await GetEmailTransactionReceiptReceivers();
                receivers.Add(salesAgent);
                var emailReceivers = String.Join(";", receivers.ToArray());

                emailService.Send(_emailServerSettings.Value.SmtpAddress, emailReceivers, subject, template, _emailServerSettings.Value.SmtpAddress);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending order receipt: ${ex.Message}");
                return false;
            }

            return true;
        }

        private async Task<List<string>> GetEmailTransactionReceiptReceivers()
        {
            var userAccounts = await _userAccountRepository.GetUserAccounts();
            var userAccountsWithDistributionModulePermissionLevel = userAccounts
                                    .Select(u => new
                                    {
                                        Id = u.Id,
                                        EmailAddress = u.EmailAddress,
                                        DistributionPermissionLevel = u.UserPermissions.Where(up => up.ModuleId == ModulesEnum.Distribution).Select(up => up.PermissionLevel).FirstOrDefault(),
                                    })
                                    .ToList();

            // Managers and current user email addresses.
            var emailReceivers = userAccountsWithDistributionModulePermissionLevel
                                                .Where(m => m.DistributionPermissionLevel <= PermissionLevelEnum.Manager || m.Id == _currentUserService.CurrentUserId)
                                                .Select(u => u.EmailAddress)
                                                .ToList();

            // var managersAndAdminEmailAddressesConcatenated = String.Join(";", emailReceivers.ToArray());

            return emailReceivers;
        }

        private async Task<string> GenerateEmailReceiptTemplate(TransactionDetails transactionDetails)
        {
            var companyName = await _beelinaRepository.SystemDbContext.Clients
                        .Where(c => c.DBHashName == _currentUserService.AppSecretToken)
                        .Select(c => c.Name)
                        .FirstOrDefaultAsync();

            var salesAgent = await _beelinaRepository.ClientDbContext.UserAccounts
                        .Where(c => c.Id == _currentUserService.CurrentUserId)
                        .Select(c => $"{c.FirstName} {c.LastName}")
                        .FirstOrDefaultAsync();

            var template = "";

            using (var rdFile = new StreamReader(String.Format("{0}/Templates/EmailTemplates/EmailNotificationOrderTransactionReceipt.html", AppDomain.CurrentDomain.BaseDirectory)))
            {
                template = rdFile.ReadToEnd();
            }

            template = template.Replace("#date", DateTime.Now.ToString("yyyy-MM-dd"));
            template = template.Replace("#company", companyName);
            template = template.Replace("#salesAgent", salesAgent);

            // Transaction Details
            template = template.Replace("#registeredDate", transactionDetails.Transaction.TransactionDate.ToString("yyyy-MM-dd"));
            template = template.Replace("#dueDate", transactionDetails.Transaction.DueDate.ToString("yyyy-MM-dd"));
            template = template.Replace("#transactionNo", transactionDetails.Transaction.InvoiceNo);
            template = template.Replace("#storeName", transactionDetails.Transaction.Store.Name);
            template = template.Replace("#barangay", transactionDetails.Transaction.Store.Barangay.Name);
            template = template.Replace("#storeType", Enum.GetName(typeof(OutletTypeEnum), transactionDetails.Transaction.Store.OutletType));
            template = template.Replace("#balance", transactionDetails.Transaction.Balance.FormatCurrency());
            template = template.Replace("#grossTotal", transactionDetails.Transaction.Total.FormatCurrency());
            template = template.Replace("#discount", transactionDetails.Transaction.Discount.ToString());

            var netTotal = (transactionDetails.Transaction.Total - (transactionDetails.Transaction.Discount / 100) * transactionDetails.Transaction.Total) - transactionDetails.BadOrderAmount;
            template = template.Replace("#netTotal", netTotal.FormatCurrency());
            template = template.Replace("#modeOfPayment", Enum.GetName(typeof(ModeOfPaymentEnum), transactionDetails.Transaction.ModeOfPayment));

            // Transaction Items
            var productTransactionsTemplate = new StringBuilder();
            foreach (var productTransaction in transactionDetails.Transaction.ProductTransactions)
            {
                productTransactionsTemplate.AppendLine("<tr class='table-product-transaction__row-item-section'>");
                productTransactionsTemplate.AppendLine($"<td><b>{productTransaction.Product.Code}</b> - {productTransaction.Product.Name} <span>({productTransaction.Product.ProductUnit.Name})</span></td>");
                productTransactionsTemplate.AppendLine($"<td class='table-product-transaction__row-item-section--number-value'>{productTransaction.Quantity}</td>");
                productTransactionsTemplate.AppendLine($"<td class='table-product-transaction__row-item-section--number-value'>{productTransaction.Price.FormatCurrency()}</td>");
                productTransactionsTemplate.AppendLine($"<td class='table-product-transaction__row-item-section--number-value'>{(productTransaction.Price * productTransaction.Quantity).FormatCurrency()}</td>");
                productTransactionsTemplate.AppendLine("</tr>");
            }

            template = template.Replace("#transactionDetails", productTransactionsTemplate.ToString());
            template = template.Replace("#badOrder", transactionDetails.BadOrderAmount.FormatCurrency());
            template = template.Replace("#bannerLogo", $"{_appHostInfo.Value.AppDomain}/assets/logo/bannerlogo-alt.jpg");

            return template;
        }
    }
}
