using Beelina.LIB.Enums;
using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IStoreRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Store> RegisterStore(Store store);
        Task<Store> UpdateStore(Store store);
        Task<List<Store>> GetStoresByBarangay(string barangayName);
        Task<List<Store>> GetAllStores();
        Task<List<SalesAgentStoreOrder>> GetSalesAgentStoreWithOrders(List<int> salesAgentIds, string fromDate, string toDate);
        Task<List<SalesAgentStoreOrder>> GetSalesAgentStoreWithoutOrders(List<int> salesAgentIds, DateFilterEnum dateFilterEnum, string fromDate, string toDate);
    }
}
