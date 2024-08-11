using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class UserSettingsRepository
        : BaseRepository<UserSetting>, IUserSettingsRepository<UserSetting>
    {
        public UserSettingsRepository(IBeelinaRepository<UserSetting> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {

        }

        public async Task<UserSetting> Register(UserSetting userSetting)
        {
            await AddEntity(userSetting);
            return userSetting;
        }

        public async Task<UserSetting> GetUserSettings(int userId)
        {
            var userSettingFromRepo = await _beelinaRepository.ClientDbContext.UserSettings
                                    .Where(u => u.UserAccountId == userId)
                                    .FirstOrDefaultAsync();

            return userSettingFromRepo;
        }
    }
}
