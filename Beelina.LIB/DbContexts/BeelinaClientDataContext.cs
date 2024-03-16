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
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductStockPerPanel> ProductStockPerPanels { get; set; }
        public DbSet<ProductStockAudit> ProductStockAudits { get; set; }
        public DbSet<ProductUnit> ProductUnits { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Store> Stores { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<ProductTransaction> ProductTransactions { get; set; }
        public DbSet<ReportNotificationEmailAddress> ReportNotificationEmailAddresses { get; set; }
        public DbSet<Barangay> Barangays { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<ProductStockPerWarehouse> ProductStockPerWarehouse { get; set; }
        public DbSet<ProductStockWarehouseAudit> ProductStockWarehouseAudit { get; set; }

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

            modelBuilder.Entity<Product>(a =>
            {
                a.HasOne(field => field.CreatedBy)
                .WithMany(fk => fk.CreatedProducts)
                .HasForeignKey(fk => fk.CreatedById)
                .HasConstraintName("FK_Product_CreatedById_Accounts_AccountId");

                a.HasOne(field => field.DeletedBy)
                .WithMany(fk => fk.DeletedProducts)
                .HasForeignKey(fk => fk.DeletedById)
                .HasConstraintName("FK_Product_DeletedById_Accounts_AccountId");

                a.HasOne(field => field.UpdatedBy)
                .WithMany(fk => fk.UpdatedProducts)
                .HasForeignKey(fk => fk.UpdatedById)
                .HasConstraintName("FK_Product_UpdatedById_Accounts_AccountId");

                a.HasOne(field => field.DeactivatedBy)
                .WithMany(fk => fk.DeactivatedProducts)
                .HasForeignKey(fk => fk.DeactivatedById)
                .HasConstraintName("FK_Product_DeactivatedById_Accounts_AccountId");
            });

            modelBuilder.Entity<Store>(a =>
            {
                a.HasOne(field => field.CreatedBy)
                .WithMany(fk => fk.CreatedStores)
                .HasForeignKey(fk => fk.CreatedById)
                .HasConstraintName("FK_Store_CreatedById_Accounts_AccountId");

                a.HasOne(field => field.DeletedBy)
                .WithMany(fk => fk.DeletedStores)
                .HasForeignKey(fk => fk.DeletedById)
                .HasConstraintName("FK_Store_DeletedById_Accounts_AccountId");

                a.HasOne(field => field.UpdatedBy)
                .WithMany(fk => fk.UpdatedStores)
                .HasForeignKey(fk => fk.UpdatedById)
                .HasConstraintName("FK_Store_UpdatedById_Accounts_AccountId");

                a.HasOne(field => field.DeactivatedBy)
                .WithMany(fk => fk.DeactivatedStores)
                .HasForeignKey(fk => fk.DeactivatedById)
                .HasConstraintName("FK_Store_DeactivatedById_Accounts_AccountId");
            });

            modelBuilder.Entity<Transaction>(a =>
            {
                a.HasOne(field => field.CreatedBy)
                .WithMany(fk => fk.CreatedTransactions)
                .HasForeignKey(fk => fk.CreatedById)
                .HasConstraintName("FK_Transaction_CreatedById_Accounts_AccountId");

                a.HasOne(field => field.DeletedBy)
                .WithMany(fk => fk.DeletedTransactions)
                .HasForeignKey(fk => fk.DeletedById)
                .HasConstraintName("FK_Transaction_DeletedById_Accounts_AccountId");

                a.HasOne(field => field.UpdatedBy)
                .WithMany(fk => fk.UpdatedTransactions)
                .HasForeignKey(fk => fk.UpdatedById)
                .HasConstraintName("FK_Transaction_UpdatedById_Accounts_AccountId");

                a.HasOne(field => field.DeactivatedBy)
                .WithMany(fk => fk.DeactivatedTransactions)
                .HasForeignKey(fk => fk.DeactivatedById)
                .HasConstraintName("FK_Transaction_DeactivatedById_Accounts_AccountId");
            });

            modelBuilder.Entity<ProductTransaction>(a =>
            {
                a.HasOne(field => field.CreatedBy)
                .WithMany(fk => fk.CreatedProductTransactions)
                .HasForeignKey(fk => fk.CreatedById)
                .HasConstraintName("FK_ProductTransaction_CreatedById_Accounts_AccountId");

                a.HasOne(field => field.DeletedBy)
                .WithMany(fk => fk.DeletedProductTransactions)
                .HasForeignKey(fk => fk.DeletedById)
                .HasConstraintName("FK_ProductTransaction_DeletedById_Accounts_AccountId");

                a.HasOne(field => field.UpdatedBy)
                .WithMany(fk => fk.UpdatedProductTransactions)
                .HasForeignKey(fk => fk.UpdatedById)
                .HasConstraintName("FK_ProductTransaction_UpdatedById_Accounts_AccountId");

                a.HasOne(field => field.DeactivatedBy)
                .WithMany(fk => fk.DeactivatedProductTransactions)
                .HasForeignKey(fk => fk.DeactivatedById)
                .HasConstraintName("FK_ProductTransaction_DeactivatedById_Accounts_AccountId");
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
