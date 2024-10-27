using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface ISubscriptionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ClientSubscriptionDetailsResult> GetClientSubscriptionDetails(string appSecretToken, string startDate);
    }
}