using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class SubscriptionRepository
        : BaseRepository<ClientSubscription>, ISubscriptionRepository<ClientSubscription>
    {
        public SubscriptionRepository(IBeelinaRepository<ClientSubscription> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.SystemDbContext)
        {
        }

        public async Task<ClientSubscriptionDetailsResult> GetClientSubscriptionDetails(string appSecretToken, string startDate)
        {
            var clientFromRepo = await _beelinaRepository.SystemDbContext.Clients
                                .Where(c => c.DBHashName == appSecretToken)
                                .FirstOrDefaultAsync() ?? throw new Exception($"Client does not exists!.");

            var clientSubscriptionFromRepo = await _beelinaRepository
                .SystemDbContext
                .ClientSubscriptions
                .Where(c =>
                    c.ClientId == clientFromRepo.Id &&
                    c.StartDate <= Convert.ToDateTime(startDate) &&
                    (c.EndDate ?? DateTime.MaxValue) >= Convert.ToDateTime(startDate) &&
                    c.IsActive && !c.IsDelete
                )
                .FirstOrDefaultAsync() ?? throw new Exception($"No subscription found for client {appSecretToken}.");

            var subscriptionFeatureFromRepo = await _beelinaRepository
                .SystemDbContext
                .SubscriptionFeatures
                .Where(c =>
                    c.Id == clientSubscriptionFromRepo.SubscriptionFeatureId &&
                    c.IsActive && !c.IsDelete
                )
                .FirstOrDefaultAsync() ?? throw new Exception($"No subscription feature found for client {appSecretToken}.");

            var subscriptionTypeFromRepo = await _beelinaRepository.SystemDbContext.Subscriptions
                .Where(c =>
                    c.Id == subscriptionFeatureFromRepo.SubscriptionId &&
                    c.IsActive && !c.IsDelete
                )
                .FirstOrDefaultAsync() ?? throw new Exception($"No subscription type found for client {appSecretToken}.");

            var subscriptionPriceVersionFromRepo = await _beelinaRepository
                .SystemDbContext
                .SubscriptionPriceVersions
                .Where(c =>
                    c.SubscriptionFeatureId == clientSubscriptionFromRepo.SubscriptionFeatureId &&
                    c.StartDate <= Convert.ToDateTime(startDate) &&
                    (c.EndDate ?? DateTime.MaxValue) >= Convert.ToDateTime(startDate) &&
                    c.IsActive && !c.IsDelete
                )
                .FirstOrDefaultAsync() ?? throw new Exception($"No subscription price found for client {appSecretToken}.");

            var subscriptionRegisterUserAddonPriceVersionFromRepo = await _beelinaRepository
                .SystemDbContext
                .SubscriptionRegisterUserAddonPriceVersion
                .Where(c =>
                    c.SubscriptionFeatureId == clientSubscriptionFromRepo.SubscriptionFeatureId &&
                    c.StartDate <= Convert.ToDateTime(startDate) &&
                    (c.EndDate ?? DateTime.MaxValue) >= Convert.ToDateTime(startDate) &&
                    c.IsActive && !c.IsDelete
                )
                .FirstOrDefaultAsync() ?? throw new Exception($"No subscription price for additional user account for client {appSecretToken}.");

            var subscriptionReportAddonPriceVersionFromRepo = await _beelinaRepository
                .SystemDbContext
                .SubscriptionReportAddonPriceVersions
                .Where(c =>
                    c.SubscriptionFeatureId == clientSubscriptionFromRepo.SubscriptionFeatureId &&
                    c.StartDate <= Convert.ToDateTime(startDate) &&
                    (c.EndDate ?? DateTime.MaxValue) >= Convert.ToDateTime(startDate) &&
                    c.IsActive && !c.IsDelete
                )
                .FirstOrDefaultAsync() ?? throw new Exception($"No subscription price for custom report for found for client {appSecretToken}.");

            var subscriptionFeatureAvailableReportsFromRepo = await _beelinaRepository
                .SystemDbContext
                .SubscriptionFeatureAvailableReports
                .Where(c =>
                    c.SubscriptionFeatureId == clientSubscriptionFromRepo.SubscriptionFeatureId &&
                    c.IsActive && !c.IsDelete
                )
                .ToListAsync();

            var subscriptionFeatureHideDashboardWidgetsFromRepo = await _beelinaRepository
                .SystemDbContext
                .SubscriptionFeatureHideDashboardWidgets
                .Where(c =>
                    c.SubscriptionFeatureId == clientSubscriptionFromRepo.SubscriptionFeatureId &&
                    c.IsActive && !c.IsDelete
                )
                .ToListAsync();

            var clientSubscriptionDetails = new ClientSubscriptionDetailsResult
            {
                ClientId = clientFromRepo.Id,
                SubscriptionFeatureId = clientSubscriptionFromRepo.Id,
                StartDate = clientSubscriptionFromRepo.StartDate,
                EndDate = clientSubscriptionFromRepo.EndDate,
                SubscriptionId = subscriptionTypeFromRepo.Id,
                SubscriptionName = subscriptionTypeFromRepo.Name,
                OfflineModeActive = subscriptionFeatureFromRepo.OfflineModeActive,
                ProductSKUMax = subscriptionFeatureFromRepo.ProductSKUMax,
                TopProductsPageActive = subscriptionFeatureFromRepo.TopProductsPageActive,
                CustomerAccountsMax = subscriptionFeatureFromRepo.CustomerAccountsMax,
                CustomersMax = subscriptionFeatureFromRepo.CustomersMax,
                DashboardDistributionPageActive = subscriptionFeatureFromRepo.DashboardDistributionPageActive,
                OrderPrintActive = subscriptionFeatureFromRepo.OrderPrintActive,
                SendReportEmailActive = subscriptionFeatureFromRepo.SendReportEmailActive,
                UserAccountsMax = subscriptionFeatureFromRepo.UserAccountsMax,
                RegisterUserAddOnActive = subscriptionFeatureFromRepo.RegisterUserAddOnActive,
                CustomReportAddOnActive = subscriptionFeatureFromRepo.CustomReportAddOnActive,
                CurrentSubscriptionPrice = subscriptionPriceVersionFromRepo is null ? 0 : subscriptionPriceVersionFromRepo.Price,
                CurrentRegisterUserAddonPrice = subscriptionRegisterUserAddonPriceVersionFromRepo is null ? 0 : subscriptionRegisterUserAddonPriceVersionFromRepo.Price,
                CurrentCustomReportAddonPrice = subscriptionReportAddonPriceVersionFromRepo is null ? 0 : subscriptionReportAddonPriceVersionFromRepo.Price
            };

            return clientSubscriptionDetails;
        }
    }
}