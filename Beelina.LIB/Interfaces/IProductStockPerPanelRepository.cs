using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IProductStockPerPanelRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ProductStockPerPanel> UpdateProductStockPerPanel(ProductStockPerPanel productStockPerPanel);
        Task<ProductStockPerPanel> GetProductStockPerPanel(int productId, int userAccountId);
    }
}
