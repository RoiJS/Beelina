using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class GeneralSettingRepository
        : BaseRepository<GeneralSetting>, IGeneralSettingRepository<GeneralSetting>
    {
        public GeneralSettingRepository(IBeelinaRepository<GeneralSetting> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {

        }

        public async Task<GeneralSetting> GetGeneralSettings()
        {
            return await _beelinaRepository.ClientDbContext.GeneralSettings.FirstOrDefaultAsync();
        }
    }
}
