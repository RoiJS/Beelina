using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class SubscriptionQuery
    {
        public async Task<IClientSubscriptionDetailsPayload> GetClientSubscriptionDetails(
            [Service] ISubscriptionRepository<ClientSubscription> subscriptionRepository,
            [Service] ILogger<SubscriptionQuery> logger,
            string appSecretToken,
            string startDate)
        {
            try
            {
                var date = !String.IsNullOrEmpty(startDate) ? startDate : DateTime.Now.ToString("yyyy-MM-dd");
                return await subscriptionRepository.GetClientSubscriptionDetails(appSecretToken, date);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get client subscription details. Params: appSecretToken = {appSecretToken}; startDate = {startDate}", appSecretToken, startDate);
                return new ClientSubscriptionNotExistsError(ex.Message);
            }
        }

        public async Task<IList<ClientSubscriptionDetailsResult>> GetSubscriptions(
            [Service] ISubscriptionRepository<ClientSubscription> subscriptionRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            int subscriptionId
        )
        {
            return await subscriptionRepository.GetSubscriptions(subscriptionId, httpContextAccessor?.HttpContext?.RequestAborted ?? default);
        }
    }
}