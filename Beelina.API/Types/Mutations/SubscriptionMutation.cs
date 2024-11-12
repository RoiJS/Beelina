using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class SubscriptionMutation
    {
        public async Task<ClientSubscription> UpdateClientSubscription(
            [Service] ILogger<SubscriptionMutation> logger,
            [Service] ISubscriptionRepository<ClientSubscription> subscriptionRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            ClientSubscriptionInput clientSubscriptionInput)
        {
            try
            {
                var result = await subscriptionRepository.UpdateClientSubscription(clientSubscriptionInput, httpContextAccessor.HttpContext.RequestAborted);

                logger.LogInformation("Successfully registered client subscription. Params: {@params}", clientSubscriptionInput);

                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to register client subscription. Params: {@params}", new
                {
                    clientSubscriptionInput
                });

                throw new Exception($"Failed to register client subscription. {ex.Message}");
            }
        }


        public async Task<bool> ApproveClientSubscription(
            [Service] ILogger<SubscriptionMutation> logger,
            [Service] ISubscriptionRepository<ClientSubscription> subscriptionRepository,
            [Service] IHttpContextAccessor httpContextAccessor,
            ClientSubscriptionInput clientSubscriptionInput)
        {
            var result = true;

            try
            {
                var resut = await subscriptionRepository.ApproveClientSubscription(clientSubscriptionInput, httpContextAccessor.HttpContext.RequestAborted);

                logger.LogInformation("Successfully approved client subscription. Params: {@params}", clientSubscriptionInput);
            }
            catch (Exception ex)
            {
                result = false;

                logger.LogError(ex, "Failed to approve client subscription. Params: {@params}", new
                {
                    clientSubscriptionInput
                });

            }

            return result;
        }
    }
}