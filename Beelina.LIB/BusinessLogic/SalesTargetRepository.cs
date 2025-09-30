using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Dtos;
using Beelina.LIB.Enums;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class SalesTargetRepository(
        IBeelinaRepository<SalesTarget> beelinaRepository,
        ITransactionRepository<Transaction> transactionRepository)
                : BaseRepository<SalesTarget>(beelinaRepository, beelinaRepository.ClientDbContext), ISalesTargetRepository<SalesTarget>
    {
        private readonly ITransactionRepository<Transaction> _transactionRepository = transactionRepository;
        public async Task<List<SalesTarget>> GetSalesTargets(int salesAgentId = 0, SalesTargetPeriodTypeEnum? periodType = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _beelinaRepository.ClientDbContext.SalesTargets
                .Include(st => st.SalesAgent)
                .Where(st => !st.IsDelete && st.IsActive);

            if (salesAgentId > 0)
                query = query.Where(st => st.SalesAgentId == salesAgentId);

            if (periodType.HasValue)
                query = query.Where(st => st.PeriodType == periodType.Value);

            if (startDate.HasValue)
                query = query.Where(st => st.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(st => st.EndDate <= endDate.Value);

            return await query.OrderByDescending(st => st.StartDate).ToListAsync();
        }

        public async Task<SalesTarget> GetSalesTargetById(int salesTargetId)
        {
            return await _beelinaRepository.ClientDbContext.SalesTargets
                .Include(st => st.SalesAgent)
                .Where(st => st.Id == salesTargetId && !st.IsDelete && st.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<List<SalesTargetProgressDto>> GetSalesTargetProgress(List<int> salesAgentIds = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _beelinaRepository.ClientDbContext.SalesTargets
                .Include(st => st.SalesAgent)
                .Where(st => !st.IsDelete && st.IsActive);

            if (salesAgentIds != null && salesAgentIds.Any())
                query = query.Where(st => salesAgentIds.Contains(st.SalesAgentId));

            if (fromDate.HasValue)
                query = query.Where(st => st.EndDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(st => st.StartDate <= toDate.Value);

            var salesTargets = await query.AsNoTracking().ToListAsync();
            var progressList = new List<SalesTargetProgressDto>();

            foreach (var target in salesTargets)
            {
                var currentSales = await GetActualSalesForPeriod(target.SalesAgentId, target.StartDate, target.EndDate);
                var storesWithoutOrders = await GetStoresWithoutOrdersCount(target.SalesAgentId, target.StartDate, target.EndDate);
                var totalStores = await GetTotalStoresForSalesAgent(target.SalesAgentId);

                var progress = CalculateSalesTargetProgress(target, currentSales, storesWithoutOrders, totalStores);
                progressList.Add(progress);
            }

            return progressList;
        }

        public async Task<SalesTargetSummaryDto> GetSalesTargetSummary(DateTime fromDate, DateTime toDate, List<int> salesAgentIds = null)
        {
            var query = _beelinaRepository.ClientDbContext.SalesTargets
                .Include(st => st.SalesAgent)
                .Where(st => !st.IsDelete && st.IsActive &&
                       st.StartDate <= toDate && st.EndDate >= fromDate);

            if (salesAgentIds != null && salesAgentIds.Any())
                query = query.Where(st => salesAgentIds.Contains(st.SalesAgentId));

            var salesTargets = await query.AsNoTracking().ToListAsync();
            var progressList = new List<SalesTargetProgressDto>();

            foreach (var target in salesTargets)
            {
                var currentSales = await GetActualSalesForPeriod(target.SalesAgentId, target.StartDate, target.EndDate);
                var storesWithoutOrders = await GetStoresWithoutOrdersCount(target.SalesAgentId, target.StartDate, target.EndDate);
                var totalStores = await GetTotalStoresForSalesAgent(target.SalesAgentId);

                var progress = CalculateSalesTargetProgress(target, currentSales, storesWithoutOrders, totalStores);
                progressList.Add(progress);
            }

            return new SalesTargetSummaryDto
            {
                DateFrom = fromDate,
                DateTo = toDate,
                SalesTargets = progressList,
                TotalTargetAmount = progressList.Sum(p => p.TargetAmount),
                TotalCurrentSales = progressList.Sum(p => p.CurrentSales),
                TotalRemainingSales = progressList.Sum(p => p.RemainingSales),
                OverallCompletionPercentage = progressList.Any() ? progressList.Average(p => p.CompletionPercentage) : 0,
                TotalSalesAgents = progressList.Select(p => p.SalesAgentId).Distinct().Count(),
                SalesAgentsOnTarget = progressList.Count(p => p.CompletionPercentage >= 100),
                SalesAgentsBehindTarget = progressList.Count(p => p.CompletionPercentage < 100),
                TotalStoresWithoutOrders = progressList.Sum(p => p.StoresWithoutOrders)
            };
        }

        public async Task<List<StoreWithoutOrderDto>> GetStoresWithoutOrders(int salesAgentId, DateTime fromDate, DateTime toDate)
        {
            // Get stores that have had transactions created by this sales agent
            var salesAgentStoreIds = await _beelinaRepository.ClientDbContext.Transactions
                .Where(t => t.CreatedById == salesAgentId && !t.IsDelete)
                .Select(t => t.StoreId)
                .Distinct()
                .ToListAsync();

            // Get stores without confirmed orders in the period
            var storesWithoutOrders = await (from store in _beelinaRepository.ClientDbContext.Stores
                                              where salesAgentStoreIds.Contains(store.Id) && !store.IsDelete && store.IsActive
                                              && !_beelinaRepository.ClientDbContext.Transactions.Any(t =>
                                                  t.StoreId == store.Id &&
                                                  t.CreatedById == salesAgentId &&
                                                  t.TransactionDate >= fromDate &&
                                                  t.TransactionDate <= toDate &&
                                                  t.Status == TransactionStatusEnum.Confirmed &&
                                                  !t.IsDelete)
                                              select new StoreWithoutOrderDto
                                              {
                                                  StoreId = store.Id,
                                                  StoreName = store.Name,
                                                  StoreCode = $"ST{store.Id:D6}", // Generate store code from ID
                                                  Address = store.Address,
                                                  SalesAgentId = salesAgentId,
                                                  SalesAgentName = _beelinaRepository.ClientDbContext.UserAccounts
                                                      .Where(u => u.Id == salesAgentId)
                                                      .Select(u => u.FirstName + " " + u.LastName)
                                                      .FirstOrDefault(),
                                                  LastOrderDate = _beelinaRepository.ClientDbContext.Transactions
                                                      .Where(t => t.StoreId == store.Id && t.CreatedById == salesAgentId && t.Status == TransactionStatusEnum.Confirmed && !t.IsDelete)
                                                      .OrderByDescending(t => t.TransactionDate)
                                                      .Select(t => t.TransactionDate)
                                                      .FirstOrDefault(),
                                                  HistoricalAverageSales = _beelinaRepository.ClientDbContext.Transactions
                                                      .Where(t => t.StoreId == store.Id && t.CreatedById == salesAgentId && t.Status == TransactionStatusEnum.Confirmed && !t.IsDelete)
                                                      .Average(t => (decimal?)t.Total) ?? 0
                                              }).ToListAsync();

            // Calculate additional fields
            foreach (var store in storesWithoutOrders)
            {
                if (store.LastOrderDate != default)
                {
                    store.DaysSinceLastOrder = (int)(DateTime.Now - store.LastOrderDate).TotalDays;
                }
            }

            return storesWithoutOrders.OrderByDescending(s => s.DaysSinceLastOrder).ToList();
        }

        public async Task<bool> HasActiveSalesTarget(int salesAgentId, DateTime startDate, DateTime endDate, int excludeTargetId = 0)
        {
            return await _beelinaRepository.ClientDbContext.SalesTargets
                .AnyAsync(st => st.SalesAgentId == salesAgentId &&
                         st.Id != excludeTargetId &&
                         !st.IsDelete && st.IsActive &&
                         ((st.StartDate <= startDate && st.EndDate >= startDate) ||
                          (st.StartDate <= endDate && st.EndDate >= endDate) ||
                          (st.StartDate >= startDate && st.EndDate <= endDate)));
        }

        public async Task<decimal> GetActualSalesForPeriod(int salesAgentId, DateTime startDate, DateTime endDate)
        {
            var fromDateString = startDate.ToString("yyyy-MM-dd");
            var toDateString = endDate.ToString("yyyy-MM-dd");
            
            var salesData = await _transactionRepository.GetSales(salesAgentId, fromDateString, toDateString);
            return (decimal)salesData.TotalSalesAmount;
        }

        public async Task DeleteSalesTargets(List<int> salesTargetIds)
        {
            var salesTargetsFromRepo = await _beelinaRepository.ClientDbContext.SalesTargets
                                .Where(st => salesTargetIds.Contains(st.Id))
                                .ToListAsync();

            DeleteMultipleEntities(salesTargetsFromRepo);
            
        }

        private SalesTargetProgressDto CalculateSalesTargetProgress(SalesTarget target, decimal currentSales, int storesWithoutOrders, int totalStores)
        {
            var now = DateTime.Now;
            var daysElapsed = Math.Max(0, (int)(now - target.StartDate).TotalDays);
            var totalDays = Math.Max(1, (int)(target.EndDate - target.StartDate).TotalDays + 1);
            var daysRemaining = Math.Max(0, (int)Math.Ceiling((target.EndDate - now).TotalDays));
            
            var remainingSales = Math.Max(0, target.TargetAmount - currentSales);
            var completionPercentage = target.TargetAmount > 0 ? (double)(currentSales / target.TargetAmount * 100) : 0;
            var targetSalesPerDay = daysRemaining > 0 ? remainingSales / daysRemaining : 0;
            var targetSalesPerStore = totalStores > 0 ? remainingSales / totalStores : 0;
            var dailyAverageSales = daysElapsed > 0 ? currentSales / daysElapsed : 0;

            return new SalesTargetProgressDto
            {
                Id = target.Id,
                SalesAgentId = target.SalesAgentId,
                SalesAgentName = $"{target.SalesAgent.FirstName} {target.SalesAgent.LastName}",
                TargetAmount = target.TargetAmount,
                PeriodType = target.PeriodType,
                StartDate = target.StartDate,
                EndDate = target.EndDate,
                Description = target.Description,
                CurrentSales = currentSales,
                RemainingSales = remainingSales,
                CompletionPercentage = completionPercentage,
                DaysRemaining = daysRemaining,
                TargetSalesPerDay = targetSalesPerDay,
                StoresWithoutOrders = storesWithoutOrders,
                TargetSalesPerStore = targetSalesPerStore,
                TotalStores = totalStores,
                IsOverdue = now > target.EndDate && completionPercentage < 100,
                IsTargetMet = completionPercentage >= 100,
                DailyAverageSales = dailyAverageSales,
                DaysElapsed = daysElapsed,
                TotalDays = totalDays
            };
        }

        private async Task<int> GetStoresWithoutOrdersCount(int salesAgentId, DateTime startDate, DateTime endDate)
        {
            // Get stores that have had transactions created by this sales agent
            var salesAgentStoreIds = await _beelinaRepository.ClientDbContext.Transactions
                .Where(t => t.CreatedById == salesAgentId && !t.IsDelete)
                .Select(t => t.StoreId)
                .Distinct()
                .ToListAsync();

            return await _beelinaRepository.ClientDbContext.Stores
                .Where(s => salesAgentStoreIds.Contains(s.Id) && !s.IsDelete && s.IsActive &&
                       !_beelinaRepository.ClientDbContext.Transactions.Any(t =>
                           t.StoreId == s.Id &&
                           t.CreatedById == salesAgentId &&
                           t.TransactionDate >= startDate &&
                           t.TransactionDate <= endDate &&
                           t.Status == TransactionStatusEnum.Confirmed &&
                           !t.IsDelete))
                .CountAsync();
        }

        private async Task<int> GetTotalStoresForSalesAgent(int salesAgentId)
        {   
            // Get total count of stores assigned to the sales agent through barangays
            return await _beelinaRepository.ClientDbContext.Stores
                .Where(s => s.Barangay.UserAccountId == salesAgentId && 
                           !s.IsDelete && s.IsActive)
                .CountAsync();
        }
    }
}