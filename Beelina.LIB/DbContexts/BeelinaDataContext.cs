﻿using Beelina.LIB.Interfaces;
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
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportCustomerCustom> ReportCustomerCustoms { get; set; }
        public DbSet<ReportControl> ReportControls { get; set; }
        public DbSet<ReportControlsRelation> ReportControlsRelations { get; set; }
        public DbSet<ReportParameter> ReportParameters { get; set; }
        public DbSet<DashboardModule> DashboardModules { get; set; }
        public DbSet<DashboardModuleWidget> DashboardModuleWidgets { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<SubscriptionFeature> SubscriptionFeatures { get; set; }
        public DbSet<ClientSubscription> ClientSubscriptions { get; set; }
        public DbSet<SubscriptionPriceVersion> SubscriptionPriceVersions { get; set; }
        public DbSet<SubscriptionRegisterUserAddonPriceVersion> SubscriptionRegisterUserAddonPriceVersion { get; set; }
        public DbSet<SubscriptionReportAddonPriceVersion> SubscriptionReportAddonPriceVersions { get; set; }
        public DbSet<SubscriptionFeatureAvailableReport> SubscriptionFeatureAvailableReports { get; set; }
        public DbSet<SubscriptionFeatureHideDashboardWidget> SubscriptionFeatureHideDashboardWidgets { get; set; }

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
