using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductTransactionRepository
        : BaseRepository<ProductTransaction>, IProductTransactionRepository<ProductTransaction>
    {
        private readonly ICurrentUserService currentUserService;

        public ProductTransactionRepository(IBeelinaRepository<ProductTransaction> beelinaRepository, ICurrentUserService currentUserService)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            this.currentUserService = currentUserService;

        }

        public async Task<List<ProductTransaction>> GetProductTransactions(int transactionId)
        {
            var productTransactionsFromRepo = await _beelinaRepository.ClientDbContext
                                                .ProductTransactions
                                                .Where(p => p.TransactionId == transactionId)
                                                .Include(p => p.Product)
                                                .Include(p => p.Product.ProductUnit)
                                                .ToListAsync();
            return productTransactionsFromRepo;
        }

        public async Task<List<TransactionTopProduct>> GetTopProducts()
        {
            var topProductsFromRepo = await _beelinaRepository.ClientDbContext
                                                .ProductTransactions
                                                .Include(p => p.Transaction)
                                                .Include(p => p.Product)
                                                .Where(p => p.Transaction.CreatedById == currentUserService.CurrentUserId)
                                                .GroupBy(p => new { p.ProductId, p.Product.Code, p.Product.Name })
                                                .Select(p => new TransactionTopProduct
                                                {
                                                    Id = p.Key.ProductId,
                                                    Code = p.Key.Code,
                                                    Name = p.Key.Name,
                                                    Count = p.Count()
                                                })
                                                .OrderByDescending(p => p.Count)
                                                .Take(10)
                                                .ToListAsync();

            return topProductsFromRepo;
        }
    }
}
