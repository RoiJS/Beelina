using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class StoreQuery
    {
        [Authorize]
        [UsePaging]
        [UseProjection]
        public async Task<IList<Store>> GetStores([Service] IStoreRepository<Store> storeRepository)
        {
            return await storeRepository.GetAllEntities().ToListObjectAsync();
        }
    }
}
