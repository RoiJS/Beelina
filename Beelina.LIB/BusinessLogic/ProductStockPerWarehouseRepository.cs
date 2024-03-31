using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductStockPerWarehouseRepository
        : BaseRepository<ProductStockPerWarehouse>, IProductStockPerWarehouseRepository<ProductStockPerWarehouse>
    {

        public ProductStockPerWarehouseRepository(IBeelinaRepository<ProductStockPerWarehouse> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }

        public async Task<ProductStockPerWarehouse> UpdateProductStockPerWarehouse(ProductStockPerWarehouse productStockPerWarehouse)
        {
            if (productStockPerWarehouse.Id == 0)
                await AddEntity(productStockPerWarehouse);
            else
                await SaveChanges();

            return productStockPerWarehouse;
        }


        public async Task<ProductStockPerWarehouse> GetProductStockPerWarehouse(int productId, int warehouseId)
        {
            var productStockPerWarehouseFromRepo = await _beelinaRepository
                                    .ClientDbContext
                                    .ProductStockPerWarehouse
                                    .Where((p) => p.ProductId == productId && p.WarehouseId == warehouseId)
                                    .FirstOrDefaultAsync();

            return productStockPerWarehouseFromRepo;
        }
    }
}
