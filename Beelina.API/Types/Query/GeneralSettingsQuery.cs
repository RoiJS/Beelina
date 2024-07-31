using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class GeneralSettingsQuery
    {
        public async Task<GeneralSetting> GetGeneralSettings([Service] IGeneralSettingRepository<GeneralSetting> generalSettingRepository)
        {
            return await generalSettingRepository.GetGeneralSettings();
        }
    }
}
