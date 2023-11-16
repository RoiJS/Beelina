using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductStockAuditRepository
        : BaseRepository<ProductStockAudit>, IProductStockAuditRepository<ProductStockAudit>
    {

        public ProductStockAuditRepository(IBeelinaRepository<ProductStockAudit> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }

        public async Task<ProductStockAudit> UpdateProductStockAudit(ProductStockAudit productStockAudit)
        {
            if (productStockAudit.Id == 0)
                await AddEntity(productStockAudit);
            else
                await SaveChanges();


            return productStockAudit;
        }

    }
}
