using Beelina.LIB.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Beelina.LIB.BusinessLogic
{
    public class BaseRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        protected readonly IBeelinaRepository<TEntity> _beelinaRepository;
        private readonly DbContext _repoDbContext;

        public BaseRepository(IBeelinaRepository<TEntity> beelinaRepository, DbContext repoDbContext)
        {
            _beelinaRepository = beelinaRepository;
            _repoDbContext = repoDbContext;

            // This will set the current database context to which TEntity 
            // will be coming from to perform CRUD and other
            // custom functions.
            _beelinaRepository.SetDbContext(_repoDbContext);
        }

        public BaseRepository()
        {

        }

        public IBaseRepository<TEntity> SetCurrentUserId(int currentUserId)
        {
            _beelinaRepository.SetCurrentUser(currentUserId);

            return this;
        }

        public async Task AddEntity(TEntity entity)
        {
            await _beelinaRepository.AddEntity(entity);
        }

        public void DeleteEntity(TEntity entity, bool forceDelete = false)
        {
            _beelinaRepository.DeleteEntity(entity, forceDelete);
        }

        public void DeleteMultipleEntities(List<TEntity> entities, bool forceDelete = false)
        {
            _beelinaRepository.DeleteMultipleEntities(entities, forceDelete);
        }

        public T DetachEntity<T>(T entity) where T : class
        {
            return _beelinaRepository.DetachEntity<T>(entity);
        }

        public List<T> DetachEntities<T>(List<T> entities) where T : class
        {
            return _beelinaRepository.DetachEntities<T>(entities);
        }

        public void SetEntityStatus(TEntity entity, bool status)
        {
            _beelinaRepository.SetEntityStatus(entity, status);
        }

        public void SetMultipleEntitiesStatus(List<TEntity> entities, bool status)
        {
            _beelinaRepository.SetMultipleEntitiesStatus(entities, status);
        }

        public bool HasChanged()
        {
            return _repoDbContext.ChangeTracker.HasChanges();
        }

        public async Task<bool> IsExists(int id)
        {
            var entity = await GetEntity(id).ToObjectAsync();
            return (entity != null);
        }

        public IBaseRepository<TEntity> GetEntity(int id)
        {
            _beelinaRepository.GetEntity(id);
            return this;
        }

        public IBaseRepository<TEntity> GetAllEntities(bool includeDeleted = false)
        {
            _beelinaRepository.GetAllEntities(includeDeleted);
            return this;
        }

        public IBaseRepository<TEntity> Includes(params Expression<Func<TEntity, object>>[] includes)
        {
            _beelinaRepository.Includes(includes);
            return this;
        }

        public async Task<TEntity> ToObjectAsync()
        {
            var entityObject = await _beelinaRepository.ToObjectAsync();
            return entityObject;
        }

        public async Task<IList<TEntity>> ToListObjectAsync()
        {
            var entitiesObject = await _beelinaRepository.ToListObjectAsync();
            return entitiesObject;
        }

        public async Task<bool> SaveChanges()
        {
            return await _beelinaRepository.SaveChangesAsync();
        }

        public async virtual Task Reset()
        {
            await _beelinaRepository.Reset();
        }
    }
}
