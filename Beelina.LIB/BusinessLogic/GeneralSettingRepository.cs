using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.BusinessLogic
{
    public class GeneralSettingRepository
        : BaseRepository<GeneralSetting>, IGeneralSettingRepository<GeneralSetting>
    {
        public GeneralSettingRepository(IBeelinaRepository<GeneralSetting> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {

        }
    }
}
