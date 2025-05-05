using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Beelina.LIB.BusinessLogic
{
    public class SubscriptionRepository
        : BaseRepository<ClientSubscription>, ISubscriptionRepository<ClientSubscription>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<SubscriptionRepository> _logger;
        private IOptions<EmailServerSettings> _emailServerSettings { get; }

        public SubscriptionRepository(
            IBeelinaRepository<ClientSubscription> beelinaRepository,
            IOptions<EmailServerSettings> emailServerSettings,
            ICurrentUserService currentUserService,
            ILogger<SubscriptionRepository> logger)
            : base(beelinaRepository, beelinaRepository.SystemDbContext)
        {
            _currentUserService = currentUserService;
            _emailServerSettings = emailServerSettings;
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
                .FirstOrDefaultAsync();

            var subscriptionReportAddonPriceVersionFromRepo = await _beelinaRepository
                .SystemDbContext
                .SubscriptionReportAddonPriceVersions
                .Where(c =>
                    c.SubscriptionFeatureId == clientSubscriptionFromRepo.SubscriptionFeatureId &&
                    c.StartDate <= Convert.ToDateTime(startDate) &&
                    (c.EndDate ?? DateTime.MaxValue) >= Convert.ToDateTime(startDate) &&
                    c.IsActive && !c.IsDelete
                )
                .FirstOrDefaultAsync();

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
                SubscriptionFeatureId = clientSubscriptionFromRepo.SubscriptionFeatureId,
                StartDate = clientSubscriptionFromRepo.StartDate,
                EndDate = clientSubscriptionFromRepo.EndDate,
                SubscriptionId = subscriptionTypeFromRepo.Id,
                SubscriptionName = subscriptionTypeFromRepo.Name,
                Description = subscriptionTypeFromRepo.Description,
                OfflineModeActive = subscriptionFeatureFromRepo.OfflineModeActive,
                ProductSKUMax = subscriptionFeatureFromRepo.ProductSKUMax,
                TopProductsPageActive = subscriptionFeatureFromRepo.TopProductsPageActive,
                CustomerAccountsMax = subscriptionFeatureFromRepo.CustomerAccountsMax,
                CustomersMax = subscriptionFeatureFromRepo.CustomersMax,
                DashboardDistributionPageActive = subscriptionFeatureFromRepo.DashboardDistributionPageActive,
                OrderPrintActive = subscriptionFeatureFromRepo.OrderPrintActive,
                SendReportEmailActive = subscriptionFeatureFromRepo.SendReportEmailActive,
                AllowExceedUserAccountsMax = subscriptionFeatureFromRepo.AllowExceedUserAccountsMax,
                UserAccountsMax = subscriptionFeatureFromRepo.UserAccountsMax,
                RegisterUserAddOnActive = subscriptionFeatureFromRepo.RegisterUserAddOnActive,
                CustomReportAddOnActive = subscriptionFeatureFromRepo.CustomReportAddOnActive,
                CurrentSubscriptionPrice = subscriptionPriceVersionFromRepo is null ? 0 : subscriptionPriceVersionFromRepo.Price,
                CurrentRegisterUserAddonPrice = subscriptionRegisterUserAddonPriceVersionFromRepo is null ? 0 : subscriptionRegisterUserAddonPriceVersionFromRepo.Price,
                CurrentCustomReportAddonPrice = subscriptionReportAddonPriceVersionFromRepo is null ? 0 : subscriptionReportAddonPriceVersionFromRepo.Price,
                SubscriptionFeatureHideDashboardWidgets = subscriptionFeatureHideDashboardWidgetsFromRepo,
                SubscriptionFeatureAvailableReports = subscriptionFeatureAvailableReportsFromRepo
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

                var clientDetails = await _beelinaRepository.SystemDbContext.Clients
                                        .Where(c => c.DBHashName == clientSubscriptionInput.ClientId)
                                        .FirstOrDefaultAsync(cancellationToken);

                if (clientSubscriptionFromRepo is null)
                {
                    var pendingClientSubscriptions = await _beelinaRepository.SystemDbContext.ClientSubscriptions
                                    .Where(cs => cs.ClientId == clientDetails.Id && cs.Approve == false)
                                    .FirstOrDefaultAsync(cancellationToken);

                    if (pendingClientSubscriptions is not null)
                    {
                        _logger.LogInformation("You already have a pending client subscription request. Please wait for approval.");
                        return null;
                    }

                    var newClientSubscription = new ClientSubscription
                    {
                        ClientId = clientDetails.Id,
                        SubscriptionFeatureId = clientSubscriptionInput.SubscriptionFeatureId,
                        StartDate = Convert.ToDateTime(clientSubscriptionInput.StartDate),
                        EndDate = String.IsNullOrEmpty(clientSubscriptionInput.EndDate) ? null : Convert.ToDateTime(clientSubscriptionInput.EndDate),
                        Approve = false
                    };

                    await AddEntity(newClientSubscription);
                    await SaveChanges(cancellationToken);

                    await SendAdminEmailNotification(newClientSubscription.Id, clientDetails.Id, clientSubscriptionInput.SubscriptionFeatureId);
                    await SendCompanyEmailNotification(newClientSubscription.Id);

                    _logger.LogInformation("Client subscription has been successfully registered! Params: {@clientSubscriptionInput}.", newClientSubscription);

                    return newClientSubscription;
                }
                else
                {
                    clientSubscriptionFromRepo.ClientId = clientDetails.Id;
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
                    var clientDetails = await _beelinaRepository.SystemDbContext.Clients
                                        .Where(c => c.DBHashName == clientSubscriptionInput.ClientId)
                                        .FirstOrDefaultAsync(cancellationToken);

                    var latestApprovedClientSubscription = await _beelinaRepository.SystemDbContext.ClientSubscriptions
                                        .Where(cs => cs.ClientId == clientDetails.Id && cs.Approve)
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

        public async Task<List<ClientSubscriptionDetailsResult>> GetSubscriptions(int subscriptionId, CancellationToken cancellationToken = default)
        {
            var startDate = DateTime.Now;
            List<ClientSubscriptionDetailsResult> clientSubscriptionDetailsResults = [];

            var subscriptionsFromRepo = await _beelinaRepository.SystemDbContext.Subscriptions
                            .Where(c =>
                                (subscriptionId == 0 || c.Id == subscriptionId) &&
                                c.IsActive &&
                                !c.IsDelete
                            ).ToListAsync(cancellationToken);


            foreach (var subscription in subscriptionsFromRepo)
            {
                var subscriptionFeatureFromRepo = await _beelinaRepository
                               .SystemDbContext
                               .SubscriptionFeatures
                               .Where(c =>
                                   c.SubscriptionId == subscription.Id &&
                                   c.IsActive && !c.IsDelete
                               )
                               .FirstOrDefaultAsync(cancellationToken);

                var subscriptionPriceVersionFromRepo = await _beelinaRepository
                    .SystemDbContext
                    .SubscriptionPriceVersions
                    .Where(c =>
                        c.SubscriptionFeatureId == subscriptionFeatureFromRepo.Id &&
                        c.StartDate <= Convert.ToDateTime(startDate) &&
                        (c.EndDate ?? DateTime.MaxValue) >= Convert.ToDateTime(startDate) &&
                        c.IsActive && !c.IsDelete
                    )
                    .FirstOrDefaultAsync(cancellationToken);

                var subscriptionRegisterUserAddonPriceVersionFromRepo = await _beelinaRepository
                    .SystemDbContext
                    .SubscriptionRegisterUserAddonPriceVersion
                    .Where(c =>
                        c.SubscriptionFeatureId == subscriptionFeatureFromRepo.Id &&
                        c.StartDate <= Convert.ToDateTime(startDate) &&
                        (c.EndDate ?? DateTime.MaxValue) >= Convert.ToDateTime(startDate) &&
                        c.IsActive && !c.IsDelete
                    )
                    .FirstOrDefaultAsync(cancellationToken);

                var subscriptionReportAddonPriceVersionFromRepo = await _beelinaRepository
                    .SystemDbContext
                    .SubscriptionReportAddonPriceVersions
                    .Where(c =>
                        c.SubscriptionFeatureId == subscriptionFeatureFromRepo.Id &&
                        c.StartDate <= Convert.ToDateTime(startDate) &&
                        (c.EndDate ?? DateTime.MaxValue) >= Convert.ToDateTime(startDate) &&
                        c.IsActive && !c.IsDelete
                    )
                    .FirstOrDefaultAsync(cancellationToken);

                var subscriptionFeatureAvailableReportsFromRepo = await _beelinaRepository
                    .SystemDbContext
                    .SubscriptionFeatureAvailableReports
                    .Where(c =>
                        c.SubscriptionFeatureId == subscriptionFeatureFromRepo.Id &&
                        c.IsActive && !c.IsDelete
                    )
                    .ToListAsync(cancellationToken);

                var subscriptionFeatureHideDashboardWidgetsFromRepo = await _beelinaRepository
                    .SystemDbContext
                    .SubscriptionFeatureHideDashboardWidgets
                    .Where(c =>
                        c.SubscriptionFeatureId == subscriptionFeatureFromRepo.Id &&
                        c.IsActive && !c.IsDelete
                    )
                    .ToListAsync(cancellationToken);

                var clientSubscriptionDetails = new ClientSubscriptionDetailsResult
                {
                    SubscriptionId = subscription.Id,
                    SubscriptionFeatureId = subscriptionFeatureFromRepo.Id,
                    SubscriptionName = subscription.Name,
                    Description = subscription.Description,
                    OfflineModeActive = subscriptionFeatureFromRepo.OfflineModeActive,
                    ProductSKUMax = subscriptionFeatureFromRepo.ProductSKUMax,
                    TopProductsPageActive = subscriptionFeatureFromRepo.TopProductsPageActive,
                    CustomerAccountsMax = subscriptionFeatureFromRepo.CustomerAccountsMax,
                    CustomersMax = subscriptionFeatureFromRepo.CustomersMax,
                    DashboardDistributionPageActive = subscriptionFeatureFromRepo.DashboardDistributionPageActive,
                    OrderPrintActive = subscriptionFeatureFromRepo.OrderPrintActive,
                    SendReportEmailActive = subscriptionFeatureFromRepo.SendReportEmailActive,
                    AllowExceedUserAccountsMax = subscriptionFeatureFromRepo.AllowExceedUserAccountsMax,
                    UserAccountsMax = subscriptionFeatureFromRepo.UserAccountsMax,
                    RegisterUserAddOnActive = subscriptionFeatureFromRepo.RegisterUserAddOnActive,
                    CustomReportAddOnActive = subscriptionFeatureFromRepo.CustomReportAddOnActive,
                    CurrentSubscriptionPrice = subscriptionPriceVersionFromRepo is null ? 0 : subscriptionPriceVersionFromRepo.Price,
                    CurrentRegisterUserAddonPrice = subscriptionRegisterUserAddonPriceVersionFromRepo is null ? 0 : subscriptionRegisterUserAddonPriceVersionFromRepo.Price,
                    CurrentCustomReportAddonPrice = subscriptionReportAddonPriceVersionFromRepo is null ? 0 : subscriptionReportAddonPriceVersionFromRepo.Price,
                    SubscriptionFeatureHideDashboardWidgets = subscriptionFeatureHideDashboardWidgetsFromRepo,
                    SubscriptionFeatureAvailableReports = subscriptionFeatureAvailableReportsFromRepo
                };

                clientSubscriptionDetailsResults.Add(clientSubscriptionDetails);
            }

            return clientSubscriptionDetailsResults;
        }

        private async Task<bool> SendAdminEmailNotification(int id, int clientId, int subscriptionFeatureId)
        {
            try
            {
                var emailService = new EmailService(_emailServerSettings.Value.SmtpServer,
                                                    _emailServerSettings.Value.SmtpAddress,
                                                    _emailServerSettings.Value.SmtpPassword,
                                                    _emailServerSettings.Value.SmtpPort);

                var emailContent = await GenerateAdminEmailReceiptTemplate(id, clientId, subscriptionFeatureId);
                var subject = "Bizual request for subcription";
                emailService.Send(
                        _emailServerSettings.Value.SmtpAddress,
                        _emailServerSettings.Value.SmtpAddress,
                        subject,
                        emailContent
                    );

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private async Task<bool> SendCompanyEmailNotification(int requestNo)
        {
            try
            {
                var emailService = new EmailService(_emailServerSettings.Value.SmtpServer,
                                                    _emailServerSettings.Value.SmtpAddress,
                                                    _emailServerSettings.Value.SmtpPassword,
                                                    _emailServerSettings.Value.SmtpPort);

                var currentUser = await _beelinaRepository.ClientDbContext.UserAccounts
                        .Where(c => c.Id == _currentUserService.CurrentUserId)
                        .FirstOrDefaultAsync();

                var emailContent = GenerateCompanyEmailReceiptTemplate();
                var subject = $"Bizual request for subcription. Request No [#{requestNo}]";
                emailService.Send(
                        _emailServerSettings.Value.SmtpAddress,
                        currentUser.EmailAddress,
                        subject,
                        emailContent
                    );

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private async Task<string> GenerateAdminEmailReceiptTemplate(int requestNo, int clientId, int subscriptionFeatureId)
        {
            var companyName = await _beelinaRepository.SystemDbContext.Clients
                        .Where(c => c.Id == clientId)
                        .Select(c => c.Name)
                        .FirstOrDefaultAsync();


            var subscriptionFeatureFromRepo = await _beelinaRepository
                                            .SystemDbContext
                                            .SubscriptionFeatures
                                            .Where(c =>
                                                c.Id == subscriptionFeatureId &&
                                                c.IsActive && !c.IsDelete
                                            )
                                            .FirstOrDefaultAsync();

            var template = "";

            using (var rdFile = new StreamReader(String.Format("{0}/Templates/EmailTemplates/EmailNotificationRequestAdminSubscription.html", AppDomain.CurrentDomain.BaseDirectory)))
            {
                template = rdFile.ReadToEnd();
            }

            template = template.Replace("#date", DateTime.Now.ToString("yyyy-MM-dd"));
            template = template.Replace("#company", companyName);
            template = template.Replace("#subscriptionName", subscriptionFeatureFromRepo.Description);
            template = template.Replace("#requestNo", requestNo.ToString());

            return template;
        }

        private string GenerateCompanyEmailReceiptTemplate()
        {
            var template = "";

            using (var rdFile = new StreamReader(String.Format("{0}/Templates/EmailTemplates/EmailNotificationRequestCompanySubscription.html", AppDomain.CurrentDomain.BaseDirectory)))
            {
                template = rdFile.ReadToEnd();
            }

            template = template.Replace("#date", DateTime.Now.ToString("yyyy-MM-dd"));

            return template;
        }

    }
}