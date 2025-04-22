using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface ISubscriptionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ClientSubscriptionDetailsResult> GetClientSubscriptionDetails(string appSecretToken, string startDate);
        Task<ClientSubscription> UpdateClientSubscription(ClientSubscriptionInput clientSubscriptionInput, CancellationToken cancellationToken = default);
        Task<bool> ApproveClientSubscription(ClientSubscriptionInput clientSubscriptionInput, CancellationToken cancellationToken = default);
        Task<List<ClientSubscriptionDetailsResult>> GetSubscriptions(int subscriptionId, CancellationToken cancellationToken = default);
    }
}
