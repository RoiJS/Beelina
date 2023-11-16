using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IProductStockAuditRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ProductStockAudit> UpdateProductStockAudit(ProductStockAudit productStockAudit);
    }
}
