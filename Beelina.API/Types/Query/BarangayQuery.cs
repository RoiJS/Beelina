using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class BarangayQuery
    {
        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        public async Task<IList<Barangay>> GetBarangays([Service] IBarangayRepository<Barangay> barangayRepository)
        {
            return await GetBarangaysAsync(barangayRepository);
        }

        [Authorize]
        public async Task<IList<Barangay>> GetAllBarangays([Service] IBarangayRepository<Barangay> barangayRepository)
        {
            return await GetBarangaysAsync(barangayRepository);
        }

        private async Task<IList<Barangay>> GetBarangaysAsync(IBarangayRepository<Barangay> barangayRepository)
        {
            return await barangayRepository.GetAllEntities().ToListObjectAsync();
        }
    }
}