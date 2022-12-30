using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Beelina.LIB.DbContexts
{
    public class BeelinaDataContext : DbContext
    {

        private readonly IDataContextHelper _dcHelper;

        public BeelinaDataContext(DbContextOptions<BeelinaDataContext> options, IDataContextHelper dcHelper) : base(options)
        {
            _dcHelper = dcHelper;
        }

        public BeelinaDataContext()
        {

        }

        public DbSet<Client> Clients { get; set; }
        public DbSet<GlobalErrorLog> GlobalErrorLogs { get; set; }
        public DbSet<GeneralInformation> GeneralInformations { get; set; }

        #region "Override functions"

        /// <summary>
        /// Overriden SaveChangesAsync to add custom logic before actual saving of entities
        /// </summary>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries().ToList();

            _dcHelper.GenerateEntityCreatedDateAndCreatedById(entries);
            _dcHelper.GenerateEntityUpdateDateAndUpdatedById(entries);

            return await base.SaveChangesAsync();
        }

        #endregion
    }
}
