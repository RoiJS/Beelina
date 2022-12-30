using Beelina.LIB.DbContexts;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Beelina.LIB.Interfaces
{
    public interface IBeelinaRepository<TEntity> where TEntity : class, IEntity
    {
        BeelinaDataContext SystemDbContext { get; }
        BeelinaClientDataContext ClientDbContext { get; }
        void SetDbContext(DbContext dbContext);
        Task AddEntity(TEntity entity);
        T DetachEntity<T>(T entity) where T : class;
        List<T> DetachEntities<T>(List<T> entities) where T : class;
        void DeleteEntity(TEntity entity, bool forceDelete);
        void DeleteMultipleEntities(List<TEntity> entities, bool forceDelete);
        void SetEntityStatus(TEntity entity, bool status);
        void SetMultipleEntitiesStatus(List<TEntity> entities, bool status);
        void SetCurrentUser(int currentUserId);
        Task Reset();
        IBeelinaRepository<TEntity> GetEntity(int id);
        IBeelinaRepository<TEntity> GetAllEntities(bool includeDeleted = false);
        IBeelinaRepository<TEntity> Includes(params Expression<Func<TEntity, object>>[] includes);
        Task<TEntity> ToObjectAsync();
        Task<IList<TEntity>> ToListObjectAsync();
        Task<bool> SaveChangesAsync();
    }
}
