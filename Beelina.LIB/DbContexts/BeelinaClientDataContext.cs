using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Beelina.LIB.DbContexts
{
    public class BeelinaClientDataContext : DbContext
    {
        private readonly IDataContextHelper _dcHelper;
        public int? CurrentUserId { get; set; }

        public BeelinaClientDataContext(DbContextOptions<BeelinaClientDataContext> options, IDataContextHelper dcHelper) : base(options)
        {
            _dcHelper = dcHelper;
        }

        #region "DB models Definitions"

        public DbSet<UserAccount> UserAccounts { get; set; }
        public DbSet<UserPermission> UserPermission { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        #endregion

        #region "Override functions"
        /// <summary>
        /// Overrides onModelCreating to add custom model creation criteria
        /// </summary>
        /// <param name="modelBuilder"></param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserAccount>(a =>
            {
                a.HasOne(field => field.CreatedBy)
                .WithMany(fk => fk.CreatedAccounts)
                .HasForeignKey(fk => fk.CreatedById)
                .HasConstraintName("FK_UserAccounts_CreatedById_Accounts_AccountId");

                a.HasOne(field => field.DeletedBy)
                .WithMany(fk => fk.DeletedAccounts)
                .HasForeignKey(fk => fk.DeletedById)
                .HasConstraintName("FK_UserAccounts_DeletedById_Accounts_AccountId");

                a.HasOne(field => field.UpdatedBy)
                .WithMany(fk => fk.UpdatedAccounts)
                .HasForeignKey(fk => fk.UpdatedById)
                .HasConstraintName("FK_UserAccounts_UpdatedById_Accounts_AccountId");

                a.HasOne(field => field.DeactivatedBy)
                .WithMany(fk => fk.DeactivatedAccounts)
                .HasForeignKey(fk => fk.DeactivatedById)
                .HasConstraintName("FK_UserAccounts_DeactivatedById_Accounts_AccountId");
            });

            modelBuilder.Entity<RefreshToken>(a =>
            {
                a.HasOne(field => field.UserAccount)
                .WithMany(fk => fk.RefreshTokens)
                .HasForeignKey(fk => fk.UserAccountId)
                .HasConstraintName("FK_RefreshToken_UserAccounts_AccountId");
            });
        }

        /// <summary>
        /// Overriden SaveChangesAsync to add custom logic before actual saving of entities
        /// </summary>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {

            var entries = ChangeTracker.Entries().ToList();

            _dcHelper.GenerateEntityCreatedDateAndCreatedById(entries, CurrentUserId);
            _dcHelper.GenerateEntityUpdateDateAndUpdatedById(entries, CurrentUserId);

            return await base.SaveChangesAsync();
        }

        /// <summary>
        /// Overriden SaveChanges to add custom logic before actual saving of entities
        /// </summary>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public override int SaveChanges()
        {
            var entries = ChangeTracker.Entries().ToList();

            _dcHelper.GenerateEntityCreatedDateAndCreatedById(entries, CurrentUserId);
            _dcHelper.GenerateEntityUpdateDateAndUpdatedById(entries, CurrentUserId);

            return base.SaveChanges();
        }

        #endregion
    }
}
