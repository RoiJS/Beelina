using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IProductStockPerWarehouseRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ProductStockPerWarehouse> UpdateProductStockPerWarehouse(ProductStockPerWarehouse productStockPerWarehouse);
        Task<ProductStockPerWarehouse> GetProductStockPerWarehouse(int productId, int warehouseId);
    }
}
