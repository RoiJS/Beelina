using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class BarangayRepository
        : BaseRepository<Barangay>, IBarangayRepository<Barangay>
    {
        public BarangayRepository(IBeelinaRepository<Barangay> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }

        public async Task<Barangay> GetBarangayByName(string name)
        {
            var barangay = await _beelinaRepository.ClientDbContext.Barangays.Where(p => p.Name == name).FirstOrDefaultAsync();
            return barangay;
        }
    }
}