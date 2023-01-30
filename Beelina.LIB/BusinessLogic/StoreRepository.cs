﻿using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.BusinessLogic
{
    public class StoreRepository
        : BaseRepository<Store>, IStoreRepository<Store>
    {
        public StoreRepository(IBeelinaRepository<Store> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }

        public async Task<Store> RegisterStore(Store store)
        {
            await AddEntity(store);

            return store;
        }
    }
}
