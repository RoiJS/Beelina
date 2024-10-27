using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Beelina.LIB.BusinessLogic
{
    public class SubscriptionRepository
        : BaseRepository<ClientSubscription>, ISubscriptionRepository<ClientSubscription>
    {
        private readonly ILogger<SubscriptionRepository> _logger;

        public SubscriptionRepository(
            IBeelinaRepository<ClientSubscription> beelinaRepository,
            ILogger<SubscriptionRepository> logger)
            : base(beelinaRepository, beelinaRepository.SystemDbContext)
        {
            _logger = logger;
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
                    c.Approve && c.IsActive && !c.IsDelete
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

        public async Task<ClientSubscription> UpdateClientSubscription(ClientSubscriptionInput clientSubscriptionInput, CancellationToken cancellationToken = default)
        {
            try
            {

                var clientSubscriptionFromRepo = await _beelinaRepository.SystemDbContext.ClientSubscriptions
                                    .Where(cs => cs.Id == clientSubscriptionInput.Id)
                                    .FirstOrDefaultAsync(cancellationToken);

                if (clientSubscriptionFromRepo is null)
                {
                    var newClientSubscription = new ClientSubscription
                    {
                        ClientId = clientSubscriptionInput.ClientId,
                        SubscriptionFeatureId = clientSubscriptionInput.SubscriptionFeatureId,
                        StartDate = Convert.ToDateTime(clientSubscriptionInput.StartDate),
                        EndDate = String.IsNullOrEmpty(clientSubscriptionInput.EndDate) ? null : Convert.ToDateTime(clientSubscriptionInput.EndDate),
                        Approve = false
                    };

                    await AddEntity(newClientSubscription);
                    await SaveChanges(cancellationToken);

                    _logger.LogInformation("Client subscription has been successfully registered! Params: {@clientSubscriptionInput}.", newClientSubscription);

                    return newClientSubscription;
                }
                else
                {
                    clientSubscriptionFromRepo.ClientId = clientSubscriptionInput.ClientId;
                    clientSubscriptionFromRepo.StartDate = Convert.ToDateTime(clientSubscriptionInput.StartDate);
                    clientSubscriptionFromRepo.EndDate = Convert.ToDateTime(clientSubscriptionInput.EndDate);

                    await SaveChanges(cancellationToken);

                    _logger.LogInformation("Client subscription has been successfully updated! Params: {@clientSubscriptionInput}.", clientSubscriptionFromRepo);

                    return clientSubscriptionFromRepo;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to register new client subscription! Params: {@clientSubscriptionInput}.", clientSubscriptionInput);

                throw;
            }
        }

        public async Task<bool> ApproveClientSubscription(ClientSubscriptionInput clientSubscriptionInput, CancellationToken cancellationToken = default)
        {
            using var transaction = _beelinaRepository.SystemDbContext.Database.BeginTransaction();

            try
            {
                var clientSubscriptionToApprovedFromRepo = await _beelinaRepository.SystemDbContext.ClientSubscriptions
                                                    .Where(cs => cs.Id == clientSubscriptionInput.Id)
                                                    .FirstOrDefaultAsync(cancellationToken);

                if (clientSubscriptionToApprovedFromRepo is not null)
                {
                    var latestApprovedClientSubscription = await _beelinaRepository.SystemDbContext.ClientSubscriptions
                                        .Where(cs => cs.ClientId == clientSubscriptionInput.ClientId && cs.Approve)
                                        .OrderByDescending(cs => cs.StartDate)
                                        .FirstOrDefaultAsync(cancellationToken);

                    // -- (1) Automatically set the current subscription end date based on the newly approved client subscription minus 1 day. 
                    if (latestApprovedClientSubscription is not null)
                    {
                        latestApprovedClientSubscription.EndDate = Convert.ToDateTime(clientSubscriptionToApprovedFromRepo.StartDate).AddDays(-1);
                    }

                    // -- (2) Approved new client subscription.
                    clientSubscriptionToApprovedFromRepo.Approve = true;
                    await _beelinaRepository.SystemDbContext.SaveChangesAsync(cancellationToken);
                }

                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation("Client subscription has been successfully approved! Params: {@clientSubscriptionInput}.", clientSubscriptionToApprovedFromRepo);

                return true;
            }
            catch (Exception ex)
            {

                await transaction.RollbackAsync(cancellationToken);

                _logger.LogError(ex, "Failed to register approved client subscription! Params: {@clientSubscriptionInput}.", clientSubscriptionInput);

                throw;
            }

        }
    }
}