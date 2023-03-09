using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductTransactionRepository
        : BaseRepository<ProductTransaction>, IProductTransactionRepository<ProductTransaction>
    {

        public ProductTransactionRepository(IBeelinaRepository<ProductTransaction> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {

        }

        public async Task<List<ProductTransaction>> GetProductTransactions(int transactionId)
        {
            var productTransactionsFromRepo = await _beelinaRepository.ClientDbContext
                                                .ProductTransactions
                                                .Where(p => p.TransactionId == transactionId)
                                                .Include(p => p.Product)
                                                .ToListAsync();
            return productTransactionsFromRepo;
        }
    }
}
