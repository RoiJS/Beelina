using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductTransactionRepository
        : BaseRepository<ProductTransaction>, IProductTransactionRepository<ProductTransaction>
    {

        public ProductTransactionRepository(IBeelinaRepository<ProductTransaction> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }
    }
}
