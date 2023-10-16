using AutoMapper;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class StoreQuery
    {
        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Store>> GetStores([Service] IStoreRepository<Store> storeRepository)
        {
            return await storeRepository.GetAllStores();
        }

        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Store>> GetStoresByBarangay([Service] IStoreRepository<Store> storeRepository, string barangayName)
        {
            return await storeRepository.GetStoresByBarangay(barangayName);
        }

        [Authorize]
        public async Task<IList<Store>> GetAllStores([Service] IStoreRepository<Store> storeRepository)
        {
            return await storeRepository.GetAllEntities()
                            .Includes(
                                c => c.PaymentMethod,
                                c => c.Barangay
                            ).ToListObjectAsync();
        }

        [Authorize]
        public async Task<IStorePayload> GetStore([Service] IStoreRepository<Store> storeRepository, [Service] IMapper mapper, int storeId)
        {
            var storeFromRepo = await storeRepository.GetEntity(storeId).Includes(s => s.PaymentMethod, s => s.Barangay).ToObjectAsync();

            var storeResult = mapper.Map<StoreInformationResult>(storeFromRepo);

            if (storeFromRepo == null)
            {
                return new StoreNotExistsError(storeId);
            }

            return storeResult;
        }
    }
}
