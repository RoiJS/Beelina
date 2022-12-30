using Beelina.LIB.DbContexts;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Beelina.LIB.BusinessLogic
{
    public class BeelinaRepository<TEntity>
        : IBeelinaRepository<TEntity> where TEntity : class, IEntity
    {
        private BeelinaDataContext _systemDbContext;
        private BeelinaClientDataContext _clientDbContext;
        private DbContext _dbContext { get; set; }

        private int _entityId;
        private bool _includeDeleted;
        private DbSet<TEntity> _dbSet;
        private int? _currentUserId;

        private Expression<Func<TEntity, object>>[] _includes;

        public BeelinaRepository(BeelinaDataContext systemDbContext, BeelinaClientDataContext clientDbContext)
        {
            _systemDbContext = systemDbContext;
            _clientDbContext = clientDbContext;
        }

        public void SetDbContext(DbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public void SetCurrentUser(int currentUserId)
        {
            _currentUserId = currentUserId;

            if (_dbContext.GetType() == typeof(BeelinaClientDataContext))
            {
                ((BeelinaClientDataContext)_dbContext).CurrentUserId = _currentUserId;
            }
        }

        /// <summary>
        /// This function inserts new entity.
        /// </summary>
        /// <param name="entity">Entity that is to be inserted</param>
        /// <typeparam name="TEntity">Class tyoe of the Entity</typeparam>
        public async Task AddEntity(TEntity entity)
        {
            _dbContext.Add(entity);
            await _dbContext.SaveChangesAsync();
        }

        /// <summary>
        /// This function will detach an entity from being tracked by EF Core
        /// </summary>
        /// <param name="entity">Class type TEntity that is to be detached</param>
        /// <returns>Detached entity</returns>
        public T DetachEntity<T>(T entity) where T : class
        {
            _dbContext.Entry(entity).State = EntityState.Detached;
            if (entity.GetType().GetProperty("Id") != null)
            {
                entity.GetType().GetProperty("Id").SetValue(entity, 0);
            }
            return entity;
        }

        /// <summary>
        /// This function will detach a list of entities from being tracked by EF Core
        /// </summary>
        /// <param name="entities">Class type of List of TEntity that are to be detached</param>
        /// <returns>Detached entities</returns>
        public List<T> DetachEntities<T>(List<T> entities) where T : class
        {
            foreach (var entity in entities)
            {
                DetachEntity(entity);
            }
            return entities;
        }

        /// <summary>
        /// This function will remove an entity.
        /// If parameter forceDelete is true, it will perform an actual deletion of the entity, 
        /// If not, it will only mark the entity as deleted and it will not remove it from the db.
        /// </summary>
        /// <param name="entity">Entity that is to be removed or just mark as remove.</param>
        /// <param name="forceDelete">This will determine if the entity will be removed from the db or just mark it as deleted</param>
        /// <typeparam name="TEntity">Class type of the entity.true Note: parameter T must a class that inherits IEntity interface</typeparam>
        public void DeleteEntity(TEntity entity, bool forceDelete)
        {
            if (forceDelete)
            {
                _dbContext.Remove(entity);
            }
            else
            {
                entity.DateDeleted = DateTime.Now;
                entity.IsDelete = true;

                if (entity is IUserActionTracker)
                    ((IUserActionTracker)entity).DeletedById = _currentUserId;
            }
        }

        /// <summary>
        /// This function will remove multiple entities at once.
        /// If parameter forceDelete is true, it will perform an actual deletion of the entity, 
        /// If not, it will only mark the entity as deleted and it will not remove it from the db.
        /// </summary>
        /// <param name="entities">Entity that is to be removed or just mark as remove.</param>
        /// <param name="forceDelete">This will determine if the entity will be removed from the db or just mark it as deleted</param>
        /// <typeparam name="TEntity">Class type of the entity.true Note: parameter T must a class that inherits IEntity interface</typeparam>
        public void DeleteMultipleEntities(List<TEntity> entities, bool forceDelete)
        {
            if (forceDelete)
            {
                _dbContext.RemoveRange(entities);
            }
            else
            {
                foreach (var entity in entities)
                {
                    entity.DateDeleted = DateTime.Now;
                    entity.IsDelete = true;

                    if (entity is IUserActionTracker)
                        ((IUserActionTracker)entity).DeletedById = _currentUserId;
                }
            }
        }

        /// <summary>
        /// This sets the status of the entity
        /// </summary>
        /// <param name="entity">The entity that will either be activated or deactivated</param>
        /// <param name="status">Status that will be set to the entity</param>
        public void SetEntityStatus(TEntity entity, bool status)
        {
            entity.IsActive = status;
            entity.DateDeactivated = status ? DateTime.MinValue : DateTime.Now;

            if (entity is IUserActionTracker)
                ((IUserActionTracker)entity).DeactivatedById = (status ? null as int? : _currentUserId);

        }

        /// <summary>
        /// This sets the status of multiple entities
        /// </summary>
        /// <param name="entities">The entities that will either be activated or deactivated</param>
        /// <param name="status">Status that will be set to the entities</param>
        public void SetMultipleEntitiesStatus(List<TEntity> entities, bool status)
        {
            foreach (var entity in entities)
            {
                // If the current status is false,
                // We will store the date when it was deactivated,
                // otherwise, reset the value with the 
                // minimum value of class datetime
                if (status == false)
                    entity.DateDeactivated = DateTime.Now;
                else
                    entity.DateDeactivated = DateTime.MinValue;

                entity.IsActive = status;

                if (entity is IUserActionTracker)
                    ((IUserActionTracker)entity).DeactivatedById = _currentUserId;
            }
        }

        /// <summary>
        /// Get Entity based on Id.
        /// </summary>
        /// <param name="id">Id of the entity that is to be retrieve</param>
        /// <returns>Return instance of the class</returns>
        public IBeelinaRepository<TEntity> GetEntity(int id)
        {
            _entityId = id;
            _dbSet = _dbContext.Set<TEntity>();
            return this;
        }

        /// <summary>
        /// Get All entities from current _dbContext.await If includeDeleted parameter is set to true, 
        /// It will retrieve all items including those who are already marked as deleted, otherwise only those non-deleted items will
        /// be retrieved.
        /// </summary>
        /// <param name="includeDeleted">Parameter that will determin if deleted items will also be included on the result</param>
        /// <returns>Return instance of the class</returns>
        public IBeelinaRepository<TEntity> GetAllEntities(bool includeDeleted = false)
        {
            _includeDeleted = includeDeleted;
            _dbSet = _dbContext.Set<TEntity>();
            return this;
        }

        public IBeelinaRepository<TEntity> Includes(params Expression<Func<TEntity, object>>[] includes)
        {
            if (includes.Length > 0)
                _includes = includes;
            return this;
        }

        public async Task<TEntity> ToObjectAsync()
        {
            var entity = await _dbSet.AsQueryable()
                                     .Includes(_includes)
                                     .FirstOrDefaultAsync(e => e.Id == _entityId);
            return entity;
        }

        public async Task<IList<TEntity>> ToListObjectAsync()
        {
            var entities = await _dbSet.AsQueryable()
                                    .Includes(_includes)
                                    .Where(e => !_includeDeleted && e.IsDelete == false)
                                    .ToListAsync();
            return entities;
        }

        /// <summary>
        /// This method performs save asynchronous that will persist any changes applied to the entity.
        /// </summary>
        /// <returns>Return true if there were affected with the changes applied and false if none.</returns>
        public async Task<bool> SaveChangesAsync()
        {
            return await _dbContext.SaveChangesAsync() > 0;
        }

        public async Task Reset()
        {
            _dbContext.RemoveRange(await _dbContext.Set<TEntity>().ToListAsync());
            await _dbContext.SaveChangesAsync();
        }

        public BeelinaDataContext SystemDbContext => _systemDbContext;
        public BeelinaClientDataContext ClientDbContext => _clientDbContext;
    }
}
