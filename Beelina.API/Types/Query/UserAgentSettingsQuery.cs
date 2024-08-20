using Beelina.LIB.Dtos;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class UserAgentSettingsQuery
    {
        [Authorize]
        public async Task<UserAgentOrderTransactionSettingsDto> GetOrderTransactionSettings(
            [Service] IUserAgentOrderTransactionSettingsRepository<UserSetting> userAgentOrderTransactionSettingsRepository,
            int userId
        )
        {
            return await userAgentOrderTransactionSettingsRepository.GetOrderTransactionSettings(userId);
        }
    }
}
