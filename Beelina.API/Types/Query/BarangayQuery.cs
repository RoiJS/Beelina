using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class BarangayQuery
    {
        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Barangay>> GetBarangays([Service] IBarangayRepository<Barangay> barangayRepository, [Service] ICurrentUserService currentUserService)
        {
            return await GetBarangaysAsync(barangayRepository, currentUserService.CurrentUserId);
        }

        [Authorize]
        public async Task<IList<Barangay>> GetAllBarangays([Service] IBarangayRepository<Barangay> barangayRepository, [Service] ICurrentUserService currentUserService)
        {
            return await GetBarangaysAsync(barangayRepository, currentUserService.CurrentUserId);
        }

        private async Task<IList<Barangay>> GetBarangaysAsync(IBarangayRepository<Barangay> barangayRepository, int currentUserId)
        {
            return await barangayRepository.GetBarangays(currentUserId);
        }
    }
}