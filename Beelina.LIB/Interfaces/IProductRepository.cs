using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IProductRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<IList<Product>> GetProducts(int userId, int productId, string filterKeyWord = "");
        Task<Product> UpdateProduct(Product product);
        Task<Product> GetProductByUniqueCode(int productId, string productCode);
        Task<Product> GetProductByCode(string productCode);
        Task<Product> CreateOrUpdateProduct(int userAccountId, ProductInput productInput, Product product);
        Task<List<ProductStockAudit>> GetProductStockAudits(int productId, int userAccountId);
        Task<List<ProductStockAuditItem>> GetProductStockAuditItems(int productId, int userAccountId, StockAuditSourceEnum stockAuditSource, string fromDate, string toDate);
        Task<List<Product>> GetProductsDetailList(int userId, string filterKeyWord = "");
        Task<Product> TransferProductStockFromOwnInventory(
            int userAccountId,
            int sourceProductId,
            int destinationProductId,
            int destinationProductNumberOfUnits,
            int sourceProductNumberOfUnits,
            int sourceNumberOfUnitsTransfered,
            TransferProductStockTypeEnum transferProductStockType);
    }
}
