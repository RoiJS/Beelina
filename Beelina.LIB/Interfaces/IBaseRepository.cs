using System.Linq.Expressions;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IBaseRepository<TEntity>
        where TEntity : class, IEntity
    {
        Task AddEntity(TEntity entity);
        void DeleteEntity(TEntity entity, bool forceDelete = false);
        void DeleteMultipleEntities(List<TEntity> entities, bool forceDelete = false);
        T DetachEntity<T>(T entity) where T : class;
        List<T> DetachEntities<T>(List<T> entities) where T : class;
        Task Reset(CancellationToken cancellationToken = default);
        void SetEntityStatus(TEntity entity, bool status);
        void SetMultipleEntitiesStatus(List<TEntity> entities, bool status);
        IBaseRepository<TEntity> SetCurrentUserId(int currentUserId);
        bool HasChanged();
        Task<bool> IsExists(int id);
        IBaseRepository<TEntity> GetEntity(int id);
        IBaseRepository<TEntity> GetAllEntities(bool includeDeleted = false);
        IBaseRepository<TEntity> Includes(params Expression<Func<TEntity, object>>[] includes);
        Task<TEntity> ToObjectAsync();
        Task<IList<TEntity>> ToListObjectAsync();
        Task<bool> SaveChanges(CancellationToken cancellationToken = default);
    }
}
