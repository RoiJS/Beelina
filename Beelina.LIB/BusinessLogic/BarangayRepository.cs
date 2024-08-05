using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class BarangayRepository
        : BaseRepository<Barangay>, IBarangayRepository<Barangay>
    {
        public BarangayRepository(IBeelinaRepository<Barangay> beelinaRepository, IUserAccountRepository<UserAccount> userAccountRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }

        public async Task<Barangay> GetBarangayByName(string name, int userId)
        {
            var barangay = await _beelinaRepository.ClientDbContext.Barangays
                                .Where(p =>
                                    p.Name == name &&
                                    p.UserAccountId == userId &&
                                    !p.IsDelete &&
                                    p.IsActive
                                ).FirstOrDefaultAsync();
            return barangay;
        }

        public async Task<List<Barangay>> GetBarangays(int currentUserId)
        {

            var barangaysFromRepo = await _beelinaRepository
                    .ClientDbContext
                    .Barangays
                    .Where(b =>
                        b.UserAccountId == currentUserId &&
                        !b.IsDelete &&
                        b.IsActive
                    )
                    .Include(b => b.Stores.Where(s => !s.IsDelete))
                    .ToListAsync();

            return barangaysFromRepo;
        }
    }
}