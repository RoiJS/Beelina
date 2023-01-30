using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IProductRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Product> RegisterProduct(Product product);
    }
}
