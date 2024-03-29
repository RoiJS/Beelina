﻿using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IStoreRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Store> RegisterStore(Store store);
        Task<Store> UpdateStore(Store store);
        Task<List<Store>> GetStoresByBarangay(string barangayName);
        Task<List<Store>> GetAllStores();
    }
}
