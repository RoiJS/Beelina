using Beelina.LIB.Dtos;
using Beelina.LIB.Enums;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface ISalesTargetRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<List<SalesTarget>> GetSalesTargets(int salesAgentId = 0, SalesTargetPeriodTypeEnum? periodType = null, DateTime? startDate = null, DateTime? endDate = null);
        Task<SalesTarget> GetSalesTargetById(int salesTargetId);
        Task<List<SalesTargetProgressDto>> GetSalesTargetProgress(List<int> salesAgentIds = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<SalesTargetSummaryDto> GetSalesTargetSummary(DateTime fromDate, DateTime toDate, List<int> salesAgentIds = null);  
        Task<List<StoreWithoutOrderDto>> GetStoresWithoutOrders(int salesAgentId, DateTime fromDate, DateTime toDate);
        Task<bool> HasActiveSalesTarget(int salesAgentId, DateTime startDate, DateTime endDate, int excludeTargetId = 0);
        Task<decimal> GetActualSalesForPeriod(int salesAgentId, DateTime startDate, DateTime endDate);
        Task DeleteSalesTargets(List<int> salesTargetIds);
    }
}