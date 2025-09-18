﻿using Beelina.LIB.Enums;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class StoreRepository
        : BaseRepository<Store>, IStoreRepository<Store>
    {
        private readonly ICurrentUserService CurrentUserService;
        public StoreRepository(IBeelinaRepository<Store> beelinaRepository, ICurrentUserService currentUserService)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            CurrentUserService = currentUserService;
        }

        public async Task<List<Store>> GetAllStores()
        {
            return await _beelinaRepository.ClientDbContext.Stores
                .Includes(s => s.Transactions)
                .Where(s => !s.IsDelete).ToListAsync();
        }

        /// <summary>
        /// Gets sales agent store orders within the specified date range.
        /// </summary>
        /// <param name="salesAgentIds">List of sales agent IDs to filter by.</param>
        /// <param name="fromDate">Start date for the date range filter.</param>
        /// <param name="toDate">End date for the date range filter.</param>
        /// <returns>A list of sales agent store orders with their associated store details.</returns>
        public async Task<List<SalesAgentStoreOrder>> GetSalesAgentStoreWithOrders(List<int> salesAgentIds, string fromDate, string toDate)
        {
            var joinRecords = await GetSalesAgentStoreWithOrdersAsync(salesAgentIds, fromDate, toDate);
            return ProcessJoinRecordsToSalesAgentStoreOrders(joinRecords);
        }

        /// <summary>
        /// Gets sales agent stores that had orders in the previous period but not in the current period.
        /// </summary>
        /// <param name="salesAgentIds">List of sales agent IDs to filter by.</param>
        /// <param name="dateFilterEnum">The date filter type to determine the previous period calculation.</param>
        /// <param name="fromDate">Start date for the current period.</param>
        /// <param name="toDate">End date for the current period.</param>
        /// <returns>A list of sales agent store orders for stores without recent orders.</returns>
        public async Task<List<SalesAgentStoreOrder>> GetSalesAgentStoreWithoutOrders(List<int> salesAgentIds, DateFilterEnum dateFilterEnum, string fromDate, string toDate)
        {
            var joinRecords = await GetSalesAgentStoreWithoutOrdersAsync(salesAgentIds, dateFilterEnum, fromDate, toDate);
            return ProcessJoinRecordsToSalesAgentStoreOrders(joinRecords);
        }
        
        public async Task<List<Store>> GetStoresByBarangay(string barangayName)
        {
            return await _beelinaRepository.ClientDbContext.Stores
                        .Includes(s => s.Transactions)
                        .Where(s =>
                            s.Barangay.Name == barangayName
                            && s.Barangay.UserAccountId == CurrentUserService.CurrentUserId
                            && !s.IsDelete
                            && s.IsActive
                        )
                        .ToListAsync();
        }

        public async Task<Store> RegisterStore(Store store)
        {
            await AddEntity(store);

            return store;
        }

        public async Task<Store> UpdateStore(Store store)
        {
            if (store.Id == 0)
                await AddEntity(store);
            else
                await SaveChanges();

            return store;
        }

        private List<SalesAgentStoreOrder> ProcessJoinRecordsToSalesAgentStoreOrders(List<(int StoreId, string StoreName, int BarangayId, string BarangayName, int SalesAgentId)> joinRecords)
        {
            var salesAgentStoreOrders = new List<SalesAgentStoreOrder>();

            foreach (var item in joinRecords)
            {
                var salesAgentStoreOrder = salesAgentStoreOrders.FirstOrDefault(s => s.SalesAgentId == item.SalesAgentId);

                if (salesAgentStoreOrder != null)
                {
                    // Check if store already exists to avoid duplicates
                    if (!salesAgentStoreOrder.StoreOrders.Any(so => so.StoreId == item.StoreId))
                    {
                        salesAgentStoreOrder.StoreOrders.Add(new StoreOrder
                        {
                            StoreId = item.StoreId,
                            Name = item.StoreName,
                            BarangayName = item.BarangayName
                        });
                    }
                }
                else
                {
                    salesAgentStoreOrders.Add(new SalesAgentStoreOrder
                    {
                        SalesAgentId = item.SalesAgentId,
                        StoreOrders = new List<StoreOrder>
                        {
                            new StoreOrder {
                               StoreId = item.StoreId,
                                Name = item.StoreName,
                                BarangayName = item.BarangayName
                            }
                        }
                    });
                }
            }

            return salesAgentStoreOrders;
        }

        private async Task<List<(int StoreId, string StoreName, int BarangayId, string BarangayName, int SalesAgentId)>> GetSalesAgentStoreWithOrdersAsync(List<int> salesAgentIds, string fromDate, string toDate)
        {
            fromDate = Convert.ToDateTime(fromDate).Add(new TimeSpan(0, 0, 0)).ToString("yyyy-MM-dd HH:mm:ss");
            toDate = Convert.ToDateTime(toDate).Add(new TimeSpan(23, 59, 0)).ToString("yyyy-MM-dd HH:mm:ss");

            var joinRecords = await (
                    from s in _beelinaRepository.ClientDbContext.Stores

                    join b in _beelinaRepository.ClientDbContext.Barangays
                        on s.BarangayId equals b.Id
                        into storesBarangayJoin
                    from sb in storesBarangayJoin.DefaultIfEmpty()

                    join t in _beelinaRepository.ClientDbContext.Transactions
                        on s.Id equals t.StoreId
                        into transactionStoreJoin
                    from ts in transactionStoreJoin.DefaultIfEmpty()

                    where
                        ts != null
                        && ts.Status == TransactionStatusEnum.Confirmed
                        && salesAgentIds.Contains(sb.UserAccountId)
                        && ts.TransactionDate >= Convert.ToDateTime(fromDate)
                        && ts.TransactionDate <= Convert.ToDateTime(toDate)
                        && ts.IsActive
                        && !ts.IsDelete
                        && s.IsActive
                        && !s.IsDelete
                        && sb.IsActive
                        && !sb.IsDelete

                    select new
                    {
                        StoreId = s.Id,
                        StoreName = s.Name,
                        BarangayId = sb.Id,
                        BarangayName = sb.Name,
                        SalesAgentId = ts.CreatedById ?? 0
                    }
                )// Remove duplicates
                .ToListAsync();

            // Convert to tuple format and return
            return joinRecords.Select(x => (x.StoreId, x.StoreName, x.BarangayId, x.BarangayName, x.SalesAgentId)).ToList();
        }

        private async Task<List<(int StoreId, string StoreName, int BarangayId, string BarangayName, int SalesAgentId)>> GetSalesAgentStoreWithoutOrdersAsync(List<int> salesAgentIds, DateFilterEnum dateFilterEnum, string fromDate, string toDate)
        {
            // Calculate previous period dates based on the date filter
            var (previousFromDate, previousToDate) = CalculatePreviousPeriodDates(dateFilterEnum, fromDate, toDate);

            // Get stores that had transactions in the PREVIOUS period
            var storesWithOrdersInPreviousPeriod = await GetSalesAgentStoreWithOrdersAsync(salesAgentIds, previousFromDate, previousToDate);
            var storesWithTransactionsInPreviousPeriod = storesWithOrdersInPreviousPeriod.Select(x => x.StoreId).Distinct().ToList();

            // Get stores that have transactions in the CURRENT period
            var storesWithOrdersInCurrentPeriod = await GetSalesAgentStoreWithOrdersAsync(salesAgentIds, fromDate, toDate);
            var storesWithTransactionsInCurrentPeriod = storesWithOrdersInCurrentPeriod.Select(x => x.StoreId).Distinct().ToList();

            // Find stores that had orders in previous period but DON'T have orders in current period
            var storesThatDroppedOff = storesWithTransactionsInPreviousPeriod
                .Where(storeId => !storesWithTransactionsInCurrentPeriod.Contains(storeId))
                .ToList();

            // Get the store details for stores that dropped off
            var joinRecords = await (
                from s in _beelinaRepository.ClientDbContext.Stores
                join b in _beelinaRepository.ClientDbContext.Barangays
                    on s.BarangayId equals b.Id
                where
                    salesAgentIds.Contains(b.UserAccountId)
                    && storesThatDroppedOff.Contains(s.Id) // Only stores that dropped off
                    && s.IsActive
                    && !s.IsDelete
                    && b.IsActive
                    && !b.IsDelete
                select new
                {
                    StoreId = s.Id,
                    StoreName = s.Name,
                    BarangayId = b.Id,
                    BarangayName = b.Name,
                    SalesAgentId = b.UserAccountId
                }
            ).Distinct().ToListAsync();

            // Convert to tuple format and return
            return joinRecords.Select(x => (x.StoreId, x.StoreName, x.BarangayId, x.BarangayName, x.SalesAgentId)).ToList();
        }

        private (string previousFromDate, string previousToDate) CalculatePreviousPeriodDates(DateFilterEnum dateFilterEnum, string fromDate, string toDate)
        {
            var currentFromDate = Convert.ToDateTime(fromDate);
            var currentToDate = Convert.ToDateTime(toDate);

            DateTime previousFromDate, previousToDate;

            switch (dateFilterEnum)
            {
                case DateFilterEnum.Daily:
                    // Previous day
                    previousFromDate = currentFromDate.AddDays(-1);
                    previousToDate = currentToDate.AddDays(-1);
                    break;

                case DateFilterEnum.Weekly:
                    // Previous week (7 days back)
                    previousFromDate = currentFromDate.AddDays(-7);
                    previousToDate = currentToDate.AddDays(-7);
                    break;

                case DateFilterEnum.Monthly:
                    // Previous month
                    previousFromDate = currentFromDate.AddMonths(-1);
                    previousToDate = currentToDate.AddMonths(-1);
                    break;

                case DateFilterEnum.Custom:
                    // For custom, calculate the duration and go back by the same duration
                    var duration = (currentToDate - currentFromDate).Days;
                    previousToDate = currentFromDate.AddDays(-1);
                    previousFromDate = previousToDate.AddDays(-duration);
                    break;

                default:
                    // Default to previous day if unknown
                    previousFromDate = currentFromDate.AddDays(-1);
                    previousToDate = currentToDate.AddDays(-1);
                    break;
            }

            return (
                previousFromDate: previousFromDate.ToString("yyyy-MM-dd"),
                previousToDate: previousToDate.ToString("yyyy-MM-dd")
            );
        }
    }
}