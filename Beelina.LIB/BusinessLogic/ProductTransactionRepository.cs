using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductTransactionRepository
        : BaseRepository<ProductTransaction>, IProductTransactionRepository<ProductTransaction>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserAccountRepository<UserAccount> _userAccountRepository;

        public ProductTransactionRepository(
            IBeelinaRepository<ProductTransaction> beelinaRepository,
            ICurrentUserService currentUserService,
            IUserAccountRepository<UserAccount> userAccountRepository
        )
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            _currentUserService = currentUserService;
            _userAccountRepository = userAccountRepository;
        }

        public async Task<List<ProductTransaction>> GetProductTransactions(int transactionId)
        {
            var productTransactionsFromRepo = await _beelinaRepository.ClientDbContext
                                                .ProductTransactions
                                                .Where(p => p.TransactionId == transactionId)
                                                .Include(p => p.Product)
                                                .Include(p => p.Product.ProductUnit)
                                                .Include(p => p.ProductTransactionQuantityHistory)
                                                .AsNoTracking()
                                                .ToListAsync();
            return productTransactionsFromRepo;
        }

        public async Task DeleteProductTransactions(List<ProductTransaction> productTransactions, CancellationToken cancellationToken = default)
        {
            DeleteMultipleEntities(productTransactions, true);
            await SaveChanges(cancellationToken);
        }

        public async Task<List<TransactionTopProduct>> GetTopSellingProducts(int userId, string fromDate = "", string toDate = "")
        {
            var userRetailModulePermission = await _userAccountRepository.GetCurrentUsersPermissionLevel(userId, ModulesEnum.Distribution);

            var productTransactionsFromRepo = from t in _beelinaRepository.ClientDbContext.Transactions
                                              join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                              on t.Id equals pt.TransactionId into productTransactionJoin
                                              from ppt in productTransactionJoin

                                              where
                                                  t.IsActive
                                                  && !t.IsDelete
                                                  && ppt.IsActive
                                                  && !ppt.IsDelete
                                                  && t.Status == TransactionStatusEnum.Confirmed
                                                  && (
                                                      userRetailModulePermission.PermissionLevel > PermissionLevelEnum.User ||
                                                      (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User && ppt.Transaction.CreatedById == userId)
                                                  )

                                              select new
                                              {
                                                  ProductId = ppt.ProductId,
                                                  TransactionDate = ppt.Transaction.TransactionDate,
                                                  Amount = ppt.Price * ppt.Quantity
                                              };

            var productTransactionsJoin = from t in productTransactionsFromRepo
                                          join p in _beelinaRepository.ClientDbContext.Products
                                          on t.ProductId equals p.Id into productJoin
                                          from ptt in productJoin

                                          join pu in _beelinaRepository.ClientDbContext.ProductUnits
                                          on ptt.ProductUnitId equals pu.Id

                                          select new
                                          {
                                              ProductId = t.ProductId,
                                              ProductUnitName = pu.Name,
                                              ProductCode = ptt.Code,
                                              ProductName = ptt.Name,
                                              TransactionDate = t.TransactionDate,
                                              Amount = t.Amount
                                          };

            if (!string.IsNullOrEmpty(fromDate) || !string.IsNullOrEmpty(toDate))
            {
                fromDate = Convert.ToDateTime(fromDate).Add(new TimeSpan(0, 0, 0)).ToString("yyyy-MM-dd HH:mm:ss");
                toDate = Convert.ToDateTime(toDate).Add(new TimeSpan(23, 59, 0)).ToString("yyyy-MM-dd HH:mm:ss");

                if (!String.IsNullOrEmpty(fromDate))
                {
                    productTransactionsJoin = productTransactionsJoin.Where(t => t.TransactionDate >= Convert.ToDateTime(fromDate));
                }

                if (!String.IsNullOrEmpty(toDate))
                {
                    productTransactionsJoin = productTransactionsJoin.Where(t => t.TransactionDate <= Convert.ToDateTime(toDate));
                }
            }

            var topProductsFromRepo = from t in productTransactionsJoin
                                      group t by new { t.ProductId, t.ProductCode, t.ProductName, t.ProductUnitName } into g
                                      select new TransactionTopProduct
                                      {
                                          Id = g.Key.ProductId,
                                          Code = g.Key.ProductCode,
                                          UnitName = g.Key.ProductUnitName,
                                          Name = g.Key.ProductName,
                                          Count = g.Count(),
                                          TotalAmount = g.Sum(s => s.Amount)
                                      };

            if (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User)
            {
                return await topProductsFromRepo.Take(10).ToListAsync();
            }
            else
            {
                return await topProductsFromRepo.ToListAsync();
            }
        }
    }
}
