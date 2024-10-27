using System.Security.Claims;
using Beelina.LIB.BusinessLogic;
using Beelina.LIB.DbContexts;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.API.Helpers.Extensions
{
    public static class ServiceRepositoryExtension
    {
        public static void RegisterServiceRepositories(this IServiceCollection services)
        {
            services.AddScoped<IDataContextHelper, DataContextHelper>();
            services.AddScoped(typeof(IBeelinaRepository<>), typeof(BeelinaRepository<>));
            services.AddScoped(typeof(IUserAccountRepository<UserAccount>), typeof(UserAccountRepository));
            services.AddScoped(typeof(IUserSettingsRepository<UserSetting>), typeof(UserSettingsRepository));
            services.AddScoped(typeof(IUserAgentOrderTransactionSettingsRepository<UserSetting>), typeof(UserAgentOrderTransactionSettingsRepository));
            services.AddScoped(typeof(IClientRepository<Client>), typeof(ClientRepository));
            services.AddScoped(typeof(IClientDbManagerRepository<IEntity>), typeof(ClientDbManagerRepository));
            services.AddScoped(typeof(IDataSeedRepository<IEntity>), typeof(DataSeedRepository));
            services.AddScoped(typeof(ICurrentUserService), typeof(CurrentUserService));
            services.AddScoped(typeof(IExtractProductFileService), typeof(ExtractProductFileService));
            services.AddScoped(typeof(IProductUnitRepository<ProductUnit>), typeof(ProductUnitRepository));
            services.AddScoped(typeof(IProductRepository<Product>), typeof(ProductRepository));
            services.AddScoped(typeof(IProductStockPerPanelRepository<ProductStockPerPanel>), typeof(ProductStockPerPanelRepository));
            services.AddScoped(typeof(IProductStockPerWarehouseRepository<ProductStockPerWarehouse>), typeof(ProductStockPerWarehouseRepository));
            services.AddScoped(typeof(IProductStockAuditRepository<ProductStockAudit>), typeof(ProductStockAuditRepository));
            services.AddScoped(typeof(IPaymentMethodRepository<PaymentMethod>), typeof(PaymentMethodRepository));
            services.AddScoped(typeof(IRefreshTokenRepository<RefreshToken>), typeof(RefreshTokenRepository));
            services.AddScoped(typeof(IStoreRepository<Store>), typeof(StoreRepository));
            services.AddScoped(typeof(ITransactionRepository<Transaction>), typeof(TransactionRepository));
            services.AddScoped(typeof(IProductTransactionRepository<ProductTransaction>), typeof(ProductTransactionRepository));
            services.AddScoped(typeof(IBarangayRepository<Barangay>), typeof(BarangayRepository));
            services.AddScoped(typeof(ISupplierRepository<Supplier>), typeof(SupplierRepository));
            services.AddScoped(typeof(IPaymentRepository<Payment>), typeof(PaymentRepository));
            services.AddScoped(typeof(IReportRepository<Report>), typeof(ReportRepository));
            services.AddScoped(typeof(IGeneralInformationRepository<GeneralInformation>), typeof(GeneralInformationRepository));
            services.AddScoped(typeof(IGeneralSettingRepository<GeneralSetting>), typeof(GeneralSettingRepository));
            services.AddScoped(typeof(ISubscriptionRepository<ClientSubscription>), typeof(SubscriptionRepository));
            services.AddTransient<ClaimsPrincipal>(s => s.GetService<IHttpContextAccessor>().HttpContext.User);
        }
    }
}