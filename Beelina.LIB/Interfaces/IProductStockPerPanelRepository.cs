using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;

namespace Beelina.LIB.Interfaces
{
    public interface IProductStockPerPanelRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ProductStockPerPanel> UpdateProductStockPerPanel(ProductStockPerPanel productStockPerPanel);
        Task<ProductStockPerPanel> GetProductStockPerPanel(int productId, int userAccountId);
        Task<List<ProductStockPerPanel>> GetDeletedProductAssignmentsItems(
            int userAccountId,
            List<int> deletedProductAssignmentProductIds,
            CancellationToken cancellationToken = default);
        Task<List<ProductStockPerPanel>> GetProductStockPerPanelsByUserAccountId(int userAccountId, CancellationToken cancellationToken = default);
    }
}
