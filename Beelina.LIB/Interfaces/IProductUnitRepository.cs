using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IProductUnitRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ProductUnit> GetProductUnitByName(string name);
    }
}
