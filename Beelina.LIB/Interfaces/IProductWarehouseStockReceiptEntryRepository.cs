using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;

namespace Beelina.LIB.Interfaces
{
    public interface IProductWarehouseStockReceiptEntryRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ProductWarehouseStockReceiptEntry> UpdateProductWarehouseStockReceiptEntry(ProductWarehouseStockReceiptEntry productWarehouseStockReceiptEntry);
        Task<ProductWarehouseStockReceiptEntry> GetProductWarehouseStockReceiptEntry(int productWarehouseStockReceiptEntryId);
        Task<List<ProductWarehouseStockReceiptEntry>> GetProductWarehouseStockReceiptEntries(ProductReceiptEntryFilter productReceiptEntryFilter, string filterKeyword = "", CancellationToken cancellationToken = default);
    }
}
