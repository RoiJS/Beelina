using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;

namespace Beelina.LIB.Interfaces
{
    public interface IProductWarehouseStockReceiptEntryRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ProductWarehouseStockReceiptEntry> UpdateProductWarehouseStockReceiptEntry(ProductWarehouseStockReceiptEntry productWarehouseStockReceiptEntry);
        Task<ProductWarehouseStockReceiptEntryResult> GetProductWarehouseStockReceiptEntry(int productWarehouseStockReceiptEntryId, CancellationToken cancellationToken = default);
        Task<List<ProductWarehouseStockReceiptEntry>> GetProductWarehouseStockReceiptEntries(ProductReceiptEntryFilter productReceiptEntryFilter, string filterKeyword = "", CancellationToken cancellationToken = default);
        Task<ProductWarehouseStockReceiptEntry> GetPurchaseOrderByUniqueCode(int purchaseOrderId, string referenceCode);
        Task<string> GetStockEntryLatestReferenceNo(CancellationToken cancellationToken = default);
    }
}
