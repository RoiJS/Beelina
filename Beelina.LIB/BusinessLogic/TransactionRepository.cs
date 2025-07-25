using System.Text;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using Beelina.LIB.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace Beelina.LIB.BusinessLogic
{
    public class TransactionRepository
        : BaseRepository<Transaction>, ITransactionRepository<Transaction>
    {
        private readonly ILogger<TransactionRepository> _logger;
        private readonly IUserAccountRepository<UserAccount> _userAccountRepository;
        private readonly IProductTransactionRepository<ProductTransaction> _productTransactionRepository;
        private readonly IPaymentRepository<Payment> _paymentRepository;
        private IOptions<EmailServerSettings> _emailServerSettings { get; }
        private readonly IOptions<AppHostInfo> _appHostInfo;
        private readonly IOptions<ApplicationSettings> _appSettings;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserSettingsRepository<UserSetting> _userSettingRepository;
        private readonly IGeneralSettingRepository<GeneralSetting> _generalSettingsRepository;

        public TransactionRepository(
            IBeelinaRepository<Transaction> beelinaRepository,
            IUserAccountRepository<UserAccount> userAccountRepository,
            IProductTransactionRepository<ProductTransaction> productTransactionRepository,
            IOptions<EmailServerSettings> emailServerSettings,
            IOptions<AppHostInfo> appHostInfo,
            IOptions<ApplicationSettings> appSettings,
            ICurrentUserService currentUserService,
            IUserSettingsRepository<UserSetting> userSettingRepository,
            IGeneralSettingRepository<GeneralSetting> generalSettingsRepository,
            IPaymentRepository<Payment> paymentRepository,
            ILogger<TransactionRepository> logger
        )
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            _logger = logger;
            _appHostInfo = appHostInfo;
            _appSettings = appSettings;
            _currentUserService = currentUserService;
            _userSettingRepository = userSettingRepository;
            _emailServerSettings = emailServerSettings;
            _productTransactionRepository = productTransactionRepository;
            _userAccountRepository = userAccountRepository;
            _generalSettingsRepository = generalSettingsRepository;
            _paymentRepository = paymentRepository;
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
                    BadOrderAmount = salesAgentSales.BadOrderAmount,
                    ChequeAmountOnHand = salesAgentSales.ChequeAmountOnHand,
                    CashAmountOnHand = salesAgentSales.CashAmountOnHand,
                    AccountReceivables = salesAgentSales.AccountReceivables,
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
            var badOrdersAmount = await GetOrdersAmount(TransactionStatusEnum.BadOrder, userId, fromDate, toDate);
            var paymentsAmount = await GetOrderPayments(userId, fromDate, toDate);
            var confirmedOrdersAmount = await GetOrdersAmount(TransactionStatusEnum.Confirmed, userId, fromDate, toDate);
            var chequeOnHandAmount = await GetOrderExpectedPaymentsAmount(TransactionStatusEnum.Confirmed, ModeOfPaymentEnum.Cheque, userId, fromDate, toDate);
            var cashOnHandAmount = await GetOrderExpectedPaymentsAmount(TransactionStatusEnum.Confirmed, ModeOfPaymentEnum.Cash, userId, fromDate, toDate);

            return new TransactionSales
            {
                TotalSalesAmount = confirmedOrdersAmount.TotalSalesAmount,
                ChequeAmountOnHand = chequeOnHandAmount.TotalSalesAmount,
                CashAmountOnHand = cashOnHandAmount.TotalSalesAmount,
                BadOrderAmount = badOrdersAmount.TotalSalesAmount,
                AccountReceivables = confirmedOrdersAmount.TotalSalesAmount - paymentsAmount
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
                var chequeOnHandAmount = await GetOrderExpectedPaymentsAmount(TransactionStatusEnum.Confirmed, ModeOfPaymentEnum.Cheque, salesAgent.Id, fromDate, toDate);
                var cashOnHandAmount = await GetOrderExpectedPaymentsAmount(TransactionStatusEnum.Confirmed, ModeOfPaymentEnum.Cash, salesAgent.Id, fromDate, toDate);

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
                TransactionDate = transactionDate,
                PaymentStatus = PaymentStatusEnum.All,
                StoreId = 0 // Assuming we want to get transactions for all stores
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
                        && (transactionsFilter == null ||
                            (transactionsFilter != null && (
                                    (String.IsNullOrEmpty(transactionsFilter.TransactionDate) || (!String.IsNullOrEmpty(transactionsFilter.TransactionDate) && t.TransactionDate == Convert.ToDateTime(transactionsFilter.TransactionDate))) &&
                                    (transactionsFilter.StoreId == 0 || s.Id == transactionsFilter.StoreId))))
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
                )
                .AsNoTracking()
                .ToListAsync();


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


            if (transactionsFilter is not null && transactionsFilter.PaymentStatus != PaymentStatusEnum.All)
            {
                if (transactionsFilter.PaymentStatus == PaymentStatusEnum.Paid)
                {
                    transactionsWithPaymentStatus = [.. transactionsWithPaymentStatus.Where(t => !t.HasUnpaidProductTransaction)];
                }
                else if (transactionsFilter.PaymentStatus == PaymentStatusEnum.Unpaid)
                {
                    transactionsWithPaymentStatus = [.. transactionsWithPaymentStatus.Where(t => t.HasUnpaidProductTransaction)];
                }
            }

            return transactionsWithPaymentStatus;
        }

        public async Task<List<Transaction>> GetTransactions(List<int> transactionIds)
        {
            var transactions = await _beelinaRepository.ClientDbContext.Transactions
                                .Where(t =>
                                    transactionIds.Contains(t.Id) &&
                                    t.IsActive &&
                                    !t.IsDelete
                                )
                                .Include(t => t.ProductTransactions)
                                .ToListAsync();

            return transactions;
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

        public async Task<TransactionDetails> GetTransaction(int transactionId, bool includeProductDetails = true)
        {
            var badOrdersAmount = 0.0;
            var transactionFromRepo = await GetEntity(transactionId)
                            .Includes(
                                t => t.Payments,
                                t => t.Store,
                                t => t.Store.Barangay,
                                t => t.Store.PaymentMethod,
                                t => t.CreatedBy
                            )
                            .ToObjectAsync();

            if (transactionFromRepo == null)
            {
                return new TransactionDetails { Transaction = null, BadOrderAmount = badOrdersAmount };
            }

            // Only get for bad order amount if the transaction status is confirmed
            if (transactionFromRepo.Status == TransactionStatusEnum.Confirmed)
            {
                badOrdersAmount = await GetBadOrderAmount(transactionFromRepo.InvoiceNo, transactionFromRepo.StoreId, transactionFromRepo.CreatedById);
            }

            transactionFromRepo.BadOrderAmount = badOrdersAmount;
            transactionFromRepo.ProductTransactions = await _productTransactionRepository.GetProductTransactions(transactionId, includeProductDetails);

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

        public async Task<Transaction> RegisterTransaction(Transaction transaction, List<int> deletedProductTransactionIds, CancellationToken cancellationToken = default)
        {
            if (transaction.Id <= 0)
                await AddEntity(transaction);
            else
            {
                if (deletedProductTransactionIds.Count > 0)
                {
                    await _productTransactionRepository.DeleteProductTransactionsByIds(deletedProductTransactionIds, cancellationToken);
                }

                await SaveChanges(cancellationToken);
            }

            return transaction;
        }

        public async Task<Transaction> RegisterTransactionWithBusinessLogic(TransactionInput transactionInput, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Start Transaction - Register Transaction");
                _logger.LogInformation("=================================================================================");

                // Get existing transaction or create new one
                var transactionFromRepo = (await GetTransaction(transactionInput.Id)).Transaction;

                if (transactionFromRepo == null)
                {
                    transactionFromRepo = MapTransactionInputToEntity(transactionInput);

                    _logger.LogInformation("Part 1 - Creating new Transaction... {@transactionInput}", transactionInput);
                }
                else
                {
                    MapTransactionInputToExistingEntity(transactionInput, transactionFromRepo);

                    _logger.LogInformation("Part 1 - Updating existing Transaction... {@transactionInput}", transactionInput);
                }

                // Process product transactions
                var updatedProductTransactions = MapProductTransactionInputsToEntities(transactionInput.ProductTransactionInputs);

                _logger.LogInformation("Part 2 - Setting up product transactions history...");

                // Set up product transaction quantity histories
                updatedProductTransactions.ForEach(t =>
                {
                    var productQuantityHistories = new List<ProductTransactionQuantityHistory>();

                    if (t.Id > 0)
                    {
                        productQuantityHistories = transactionFromRepo
                                .ProductTransactions
                                .Where(pt => pt.ProductId == t.ProductId)
                                .Select(pt => pt.ProductTransactionQuantityHistory)
                                .First();

                        var productTransactionFromInput = transactionInput
                                .ProductTransactionInputs
                                .Where(pt => pt.ProductId == t.ProductId)
                                .First();

                        if (productTransactionFromInput.CurrentQuantity != productTransactionFromInput.Quantity)
                        {
                            productQuantityHistories.Add(new ProductTransactionQuantityHistory
                            {
                                ProductTransactionId = t.Id,
                                Quantity = productTransactionFromInput.CurrentQuantity
                            });
                        }
                    }

                    t.Status = !transactionInput.Paid ? PaymentStatusEnum.Unpaid : PaymentStatusEnum.Paid;

                    if (productQuantityHistories.Count > 0)
                    {
                        t.ProductTransactionQuantityHistory = productQuantityHistories;
                    }
                });

                _logger.LogInformation("Part 3 - Checking deleted product transactions...");

                // Check for deleted product transactions
                var deletedProductTransactions = transactionFromRepo.ProductTransactions
                    .Where(ptRepo => !transactionInput.ProductTransactionInputs.Any(ptInput => ptInput.Id == ptRepo.Id))
                    .ToList();

                // Get IDs of deleted product transactions to avoid tracking issues
                var deletedProductTransactionIds = deletedProductTransactions.Select(pt => pt.Id).ToList();

                transactionFromRepo.ProductTransactions = updatedProductTransactions;

                // Register automatic payment if transaction is paid and confirmed
                if (transactionInput.Paid &&
                  transactionInput.Status == TransactionStatusEnum.Confirmed &&
                  transactionFromRepo.Payments.Count == 0)
                {
                    _logger.LogInformation("Part 4 - Auto-payment registration...");

                    var newPayment = new Payment
                    {
                        Amount = transactionFromRepo.NetTotal,
                        PaymentDate = transactionFromRepo.TransactionDate
                                    .AddHours(DateTime.UtcNow.Hour)
                                    .AddMinutes(DateTime.UtcNow.Minute)
                                    .AddSeconds(DateTime.UtcNow.Second),
                        Notes = "Automatic Payment Registration"
                    };
                    transactionFromRepo.Payments.Add(newPayment);
                }

                // Save the transaction
                await RegisterTransaction(transactionFromRepo, deletedProductTransactionIds, cancellationToken);

                if (transactionInput.Id > 0)
                {
                    _logger.LogInformation("Successfully update transaction. Params: {@params}", new
                    {
                        transactionInput
                    });
                }
                else
                {
                    _logger.LogInformation("Successfully register transaction. Params: {@params}", new
                    {
                        transactionInput
                    });
                }

                _logger.LogInformation("End of transaction");
                _logger.LogInformation("=================================================================================");

                return transactionFromRepo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to register/update transaction. Params: {@params}", new
                {
                    transactionInput
                });
                _logger.LogInformation("=================================================================================");

                throw new InvalidOperationException("Failed to register/update transaction.", ex);
            }
        }

        private static Transaction MapTransactionInputToEntity(TransactionInput input)
        {
            return new Transaction
            {
                Id = input.Id,
                InvoiceNo = input.InvoiceNo,
                TransactionDate = DateTime.TryParse(input.TransactionDate, out var transactionDate) ? transactionDate : DateTime.Now,
                Status = input.Status,
                ModeOfPayment = input.ModeOfPayment,
                Discount = input.Discount,
                StoreId = input.StoreId,
                DueDate = DateTime.TryParse(input.DueDate, out var dueDate) ? dueDate : DateTime.Now,
                IsActive = true,
                IsDelete = false
            };
        }

        private static void MapTransactionInputToExistingEntity(TransactionInput input, Transaction existing)
        {
            existing.InvoiceNo = input.InvoiceNo;
            existing.TransactionDate = DateTime.TryParse(input.TransactionDate, out var transactionDate) ? transactionDate : DateTime.Now;
            existing.DueDate = DateTime.TryParse(input.DueDate, out var dueDate) ? dueDate : DateTime.Now;
            existing.Status = input.Status;
            existing.ModeOfPayment = input.ModeOfPayment;
            existing.Discount = input.Discount;
            existing.StoreId = input.StoreId;
        }

        private static List<ProductTransaction> MapProductTransactionInputsToEntities(List<ProductTransactionInput> inputs)
        {
            return [.. inputs.Select(input => new ProductTransaction
            {
                Id = input.Id,
                ProductId = input.ProductId,
                Price = input.Price,
                Quantity = input.Quantity,
                IsActive = true,
                IsDelete = false
            })];
        }

        public async Task<double> GetBadOrderAmount(string transactionNo, int storeId, int? userId)
        {
            var badOrdersFromRepo = (from t in _beelinaRepository.ClientDbContext.Transactions
                                     join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                     on t.Id equals pt.TransactionId

                                     where
                                         t.Status == TransactionStatusEnum.BadOrder
                                         && t.CreatedById == userId
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

        private async Task<TransactionSales> GetOrderExpectedPaymentsAmount(TransactionStatusEnum status, ModeOfPaymentEnum paymentMethod, int userId, string fromDate, string toDate)
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

        private async Task<double> GetOrderPayments(int userId, string fromDate, string toDate)
        {
            var userRetailModulePermission = await _userAccountRepository.GetCurrentUsersPermissionLevel(userId, ModulesEnum.Distribution);

            var transactionWithPayments = (from t in _beelinaRepository.ClientDbContext.Transactions
                                           join pt in _beelinaRepository.ClientDbContext.Payments
                                           on t.Id equals pt.TransactionId

                                           where
                                               t.Status == TransactionStatusEnum.Confirmed
                                               // Get all orders if current user is Manager or Admininistrator
                                               && (
                                                   userRetailModulePermission.PermissionLevel > PermissionLevelEnum.User ||
                                                   (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User && t.CreatedById == userId)
                                               )
                                               && t.IsDelete == false
                                               && t.IsActive
                                               && pt.IsDelete == false
                                               && pt.IsActive
                                           select new
                                           {
                                               Transaction = t,
                                               Payments = pt
                                           });

            if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
            {
                fromDate = Convert.ToDateTime(fromDate).Add(new TimeSpan(0, 0, 0)).ToString("yyyy-MM-dd HH:mm:ss");
                toDate = Convert.ToDateTime(toDate).Add(new TimeSpan(23, 59, 0)).ToString("yyyy-MM-dd HH:mm:ss");

                transactionWithPayments = transactionWithPayments.Where(t =>
                        t.Transaction.TransactionDate >= Convert.ToDateTime(fromDate)
                        && t.Transaction.TransactionDate <= Convert.ToDateTime(toDate)
                );
            }

            // Extract Sales per Transaction
            var transactionPayments = transactionWithPayments.Sum(p => p.Payments.Amount);

            return transactionPayments;
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
            SetCurrentUserId(_currentUserService.CurrentUserId);

            // Mark Product Transactions as Paid
            var transactionsFromRepo = await MarkProductTransactionsAsPaid(transactionIds, paid);

            // Add Auto Payment for Transactions
            await AddAutoPaymentForTransactions(transactionIds, paid);

            return transactionsFromRepo;
        }

        public async Task<List<Transaction>> SetTransactionsStatus(List<int> transactionIds, TransactionStatusEnum status, bool markAsPaid)
        {
            var transactionsFromRepo = await _beelinaRepository.ClientDbContext.Transactions
                                .Where(t => transactionIds.Contains(t.Id))
                                .Includes(t => t.ProductTransactions)
                                .ToListAsync();

            SetCurrentUserId(_currentUserService.CurrentUserId);

            // Update status for all transactions
            transactionsFromRepo.ForEach(t => t.Status = status);

            if (markAsPaid)
            {
                foreach (var transaction in transactionsFromRepo)
                {
                    // Get up-to-date transaction details to access computed Balance
                    var transactionDetails = await GetTransaction(transaction.Id, false);
                    var currentTransaction = transactionDetails.Transaction;

                    if (currentTransaction != null && currentTransaction.Balance > 0)
                    {
                        var payment = new Payment
                        {
                            TransactionId = currentTransaction.Id,
                            Amount = currentTransaction.Balance,
                            PaymentDate = DateTime.UtcNow,
                            
                            Notes = "Auto payment. Marked as paid by status update."
                        };
                        await _paymentRepository.RegisterPayment(payment);
                    }

                    transaction.ProductTransactions?.ForEach(pt => pt.Status = PaymentStatusEnum.Paid);
                }
            }

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

        public async Task<bool> SendInvoiceTransaction(int userId, int transactionId, IFile file)
        {
            try
            {
                var generalSetting = await _generalSettingsRepository.GetGeneralSettings();
                var userSettingsFromRepo = await _userSettingRepository.GetUserSettings(userId);
                var userAccount = await _userAccountRepository.GetEntity(userId).ToObjectAsync();
                var transactionFromRepo = await GetEntity(transactionId).ToObjectAsync();

                var emailService = new EmailService(_emailServerSettings.Value.SmtpServer,
                               _emailServerSettings.Value.SmtpAddress,
                               _emailServerSettings.Value.SmtpPassword,
                               _emailServerSettings.Value.SmtpPort);
                var emailAddress = userSettingsFromRepo.SendReceiptEmailAddress;
                var subject = String.Format("Invoice Receipt - {0}", transactionFromRepo.InvoiceNo);
                var emailContent = GenerateInvoiceReceiptEmailContent(transactionFromRepo.InvoiceNo, generalSetting.CompanyName, userAccount.PersonFullName);
                var fileName = String.Format("Invoice Receipt - {0}.pdf", transactionFromRepo.InvoiceNo);

                await using Stream stream = file.OpenReadStream();
                emailService.SetFileAttachment(stream.ToByteArray(), fileName);
                emailService.Send(
                        _emailServerSettings.Value.SmtpAddress,
                        emailAddress,
                        subject,
                        emailContent,
                        "",
                        _emailServerSettings.Value.SmtpAddress
                    );
                return true;
            }
            catch
            {
                return false;
            }
        }

        private async Task<List<Transaction>> AddAutoPaymentForTransactions(List<int> transactionIds, bool paid)
        {
            var updatedTransactions = new List<Transaction>();

            if (paid)
            {
                foreach (var transactionId in transactionIds)
                {
                    // Use repository method to get transaction with all necessary fields
                    var transactionFromRepo = await GetTransaction(transactionId);
                    var transaction = transactionFromRepo.Transaction;

                    if (transaction != null && transaction.Balance > 0)
                    {
                        var payment = new Payment
                        {
                            TransactionId = transaction.Id,
                            Amount = transaction.Balance,
                            PaymentDate = DateTime.UtcNow,
                            Notes = "Auto payment. Marked as paid by administrator."
                        };

                        await _paymentRepository.RegisterPayment(payment);
                    }

                    updatedTransactions.Add(transaction);
                }
            }

            return updatedTransactions;
        }

        private async Task<List<Transaction>> MarkProductTransactionsAsPaid(List<int> transactionIds, bool paid)
        {
            var transactionsFromRepo = await _beelinaRepository.ClientDbContext.Transactions
                                .Where(t => transactionIds.Contains(t.Id))
                                .Includes(t => t.ProductTransactions)
                                .ToListAsync();

            transactionsFromRepo.ForEach(t => t.ProductTransactions.ForEach(p => p.Status = !paid ? PaymentStatusEnum.Unpaid : PaymentStatusEnum.Paid));

            await SaveChanges();

            return transactionsFromRepo;
        }

        private string GenerateInvoiceReceiptEmailContent(string transactionNo, string company, string salesAgent)
        {
            var template = "";

            using (var rdFile = new StreamReader(String.Format("{0}/Templates/EmailTemplates/EmailNotificationSendInvoiceTransaction.html", AppDomain.CurrentDomain.BaseDirectory)))
            {
                template = rdFile.ReadToEnd();
            }

            template = template.Replace("#transactionNo", transactionNo);
            template = template.Replace("#company", company);
            template = template.Replace("#salesAgent", salesAgent);

            return template;
        }

        public async Task<List<InvalidProductTransactionOverallQuantitiesTransaction>> ValidateMultipleTransactionsProductQuantities(
            List<int> transactionIds,
            int userAccountId,
            IProductRepository<Product> productRepository,
            CancellationToken cancellationToken = default)
        {
            var transactions = await GetTransactions(transactionIds);
            var transactionInputs = MapTransactionsToInputs(transactions);

            return await ValidateProductTransactionsQuantities(transactionInputs, userAccountId, productRepository, cancellationToken);
        }

        public async Task<List<InvalidProductTransactionOverallQuantitiesTransaction>> ValidateProductTransactionsQuantities(
            List<TransactionInput> transactionInputs,
            int userAccountId,
            IProductRepository<Product> productRepository,
            CancellationToken cancellationToken = default)
        {

            if (cancellationToken.IsCancellationRequested)
            {
                throw new OperationCanceledException(cancellationToken);
            }

            var productsFromRepo = await productRepository.GetProducts(userAccountId, 0, "", null, cancellationToken);

            List<ProductTransactionOverallQuantities> allProductTransactionOverallQuantities = [];
            List<ProductTransactionOverallQuantities> invalidProductTransactionOverallQuantities = [];

            // Calculate overall quantities per product across all transactions
            foreach (TransactionInput transactionInput in transactionInputs)
            {
                foreach (ProductTransactionInput productTransaction in transactionInput.ProductTransactionInputs)
                {
                    var productTransactionOverallQuantities = allProductTransactionOverallQuantities
                        .FirstOrDefault(p => p.ProductId == productTransaction.ProductId);

                    if (productTransactionOverallQuantities is null)
                    {
                        allProductTransactionOverallQuantities.Add(new ProductTransactionOverallQuantities
                        {
                            ProductId = productTransaction.ProductId,
                            OverallQuantity = productTransaction.Quantity,
                            ProductTransactionOverallQuantitiesTransactions = [new ProductTransactionOverallQuantitiesTransaction
                            {
                                TransactionId = transactionInput.Id,
                                TransactionCode = transactionInput.InvoiceNo
                            }]
                        });
                    }
                    else
                    {
                        productTransactionOverallQuantities.OverallQuantity += productTransaction.Quantity;
                        productTransactionOverallQuantities.ProductTransactionOverallQuantitiesTransactions.Add(new ProductTransactionOverallQuantitiesTransaction
                        {
                            TransactionId = transactionInput.Id,
                            TransactionCode = transactionInput.InvoiceNo
                        });
                    }
                }
            }

            // Identify products with insufficient stock
            foreach (var productTransactionOverallQuantity in allProductTransactionOverallQuantities)
            {
                var product = productsFromRepo.FirstOrDefault(p => p.Id == productTransactionOverallQuantity.ProductId);

                if (product is not null && product.StockQuantity < productTransactionOverallQuantity.OverallQuantity)
                {
                    productTransactionOverallQuantity.ProductCode = product.Code;
                    productTransactionOverallQuantity.ProductName = product.Name;
                    productTransactionOverallQuantity.CurrentQuantity = product.StockQuantity;
                    invalidProductTransactionOverallQuantities.Add(productTransactionOverallQuantity);
                }
            }

            // Group invalid products by transaction
            List<InvalidProductTransactionOverallQuantitiesTransaction> invalidProductTransactions = [];

            foreach (var invalid in invalidProductTransactionOverallQuantities)
            {
                foreach (var transaction in invalid.ProductTransactionOverallQuantitiesTransactions)
                {
                    var invalidProductTransaction = invalidProductTransactions
                        .FirstOrDefault(i => i.TransactionId == transaction.TransactionId);

                    if (invalidProductTransaction is null)
                    {
                        var invalidPT = new InvalidProductTransactionOverallQuantitiesTransaction
                        {
                            TransactionId = transaction.TransactionId,
                            TransactionCode = transaction.TransactionCode
                        };
                        invalidPT.InvalidProductTransactionOverallQuantities.Add(new InvalidProductTransactionOverallQuantities
                        {
                            ProductId = invalid.ProductId,
                            ProductCode = invalid.ProductCode,
                            ProductName = invalid.ProductName,
                            CurrentQuantity = invalid.CurrentQuantity,
                            OverallQuantity = invalid.OverallQuantity,
                        });

                        invalidProductTransactions.Add(invalidPT);
                    }
                    else
                    {
                        invalidProductTransaction.InvalidProductTransactionOverallQuantities.Add(
                            new InvalidProductTransactionOverallQuantities
                            {
                                ProductId = invalid.ProductId,
                                ProductCode = invalid.ProductCode,
                                ProductName = invalid.ProductName,
                                CurrentQuantity = invalid.CurrentQuantity,
                                OverallQuantity = invalid.OverallQuantity
                            }
                        );
                    }
                }
            }

            return invalidProductTransactions;
        }

        private List<TransactionInput> MapTransactionsToInputs(List<Transaction> transactions)
        {
            var transactionInputs = new List<TransactionInput>();

            foreach (var transaction in transactions)
            {
                var transactionInput = new TransactionInput
                {
                    Id = transaction.Id,
                    InvoiceNo = transaction.InvoiceNo,
                    ProductTransactionInputs = new List<ProductTransactionInput>()
                };

                foreach (var productTransaction in transaction.ProductTransactions)
                {
                    transactionInput.ProductTransactionInputs.Add(new ProductTransactionInput
                    {
                        Id = productTransaction.Id,
                        ProductId = productTransaction.ProductId,
                        Quantity = productTransaction.Quantity
                    });
                }

                transactionInputs.Add(transactionInput);
            }

            return transactionInputs;
        }
    }
}
