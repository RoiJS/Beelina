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
    }
}
