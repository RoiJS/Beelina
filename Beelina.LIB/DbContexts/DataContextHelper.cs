using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Beelina.LIB.DbContexts
{
    public class DataContextHelper : IDataContextHelper
    {
        /// <summary>
        /// Auto generate data updated for each updated entities
        /// </summary>
        public void GenerateEntityUpdateDateAndUpdatedById(List<EntityEntry> entries, int? currentUserId)
        {
            var currentDateTime = DateTime.Now;
            // get a list of all Modified entries which implement the IUpdatable interface
            var updatedEntries = GetEntityEntries(EntityState.Modified, entries);

            updatedEntries.ForEach(e =>
            {
                // If entity is not marked as deleted, that is the only time that 
                // we will set updated date time and updated by id in order 
                // to separate the idea of 'Delete' from 'Update' action 
                // since delete will only set the property IsDelete to true
                // which also indicates an update operation has been performed.
                if (!((Entity)e.Entity).IsDelete)
                {
                    // Set DateUpdated
                    ((Entity)e.Entity).DateUpdated = currentDateTime;

                    // Set Updated by id
                    if (e.Entity is IUserActionTracker)
                    {
                        ((IUserActionTracker)e.Entity).UpdatedById = currentUserId;
                    }
                }
            });
        }

        /// <summary>
        /// Auto generate created date for each added entities
        /// </summary>
        public void GenerateEntityCreatedDateAndCreatedById(List<EntityEntry> entries, int? currentUserId)
        {
            var currentDateTime = DateTime.Now;
            // get a list of all Added entries which implement the IUpdatable interface
            var addedEntries = GetEntityEntries(EntityState.Added, entries);

            addedEntries.ForEach(e =>
            {
                // Set Created date
                ((Entity)e.Entity).DateCreated = currentDateTime;

                // Set created by id
                if (e.Entity is IUserActionTracker)
                {
                    ((IUserActionTracker)e.Entity).CreatedById = currentUserId;
                }
            });
        }

        /// <summary>
        /// /// Get entities based on the entity state supplied on parameter entityState
        /// </summary>
        /// <param name="entityState"></param>
        /// <param name="entries"></param>
        /// <returns>List of entity entries</returns>
        private List<EntityEntry> GetEntityEntries(EntityState entityState, List<EntityEntry> entries)
        {
            var entityEntries = entries.Where(e => e.Entity is Entity)
                    .Where(e => e.State == entityState)
                    .ToList();

            return entityEntries;
        }
    }
}
