using Beelina.LIB.Dtos;
using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class SalesTargetQuery
    {
        [Authorize]
        [UseOffsetPaging(MaxPageSize = 50, DefaultPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<IList<SalesTarget>> GetSalesTargets(
            [Service] ISalesTargetRepository<SalesTarget> salesTargetRepository, 
            int salesAgentId = 0, 
            SalesTargetPeriodTypeEnum? periodType = null, 
            DateTime? startDate = null, 
            DateTime? endDate = null)
        {
            return await salesTargetRepository.GetSalesTargets(salesAgentId, periodType, startDate, endDate);
        }

        [Authorize]
        public async Task<SalesTarget> GetSalesTargetById(
            [Service] ISalesTargetRepository<SalesTarget> salesTargetRepository, 
            int salesTargetId)
        {
            return await salesTargetRepository.GetSalesTargetById(salesTargetId);
        }

        [Authorize]
        public async Task<List<SalesTargetProgressDto>> GetSalesTargetProgress(
            [Service] ISalesTargetRepository<SalesTarget> salesTargetRepository, 
            List<int> salesAgentIds, 
            DateTime? fromDate = null, 
            DateTime? toDate = null)
        {
            return await salesTargetRepository.GetSalesTargetProgress(salesAgentIds, fromDate, toDate);
        }

        [Authorize]
        public async Task<SalesTargetSummaryDto> GetSalesTargetSummary(
            [Service] ISalesTargetRepository<SalesTarget> salesTargetRepository, 
            DateTime fromDate, 
            DateTime toDate, 
            List<int> salesAgentIds)
        {
            return await salesTargetRepository.GetSalesTargetSummary(fromDate, toDate, salesAgentIds);
        }
    }
}