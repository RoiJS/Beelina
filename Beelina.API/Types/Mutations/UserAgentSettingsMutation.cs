using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;
namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class UserAgentSettingsMutation
    {
        [Authorize]
        public async Task<bool> SaveUserAgentOrderTransactionSettings(
            [Service] IUserAgentOrderTransactionSettingsRepository<UserSetting> userAgentOrderTransactionSettingsRepository,
            [Service] ICurrentUserService currentUserService,
            UserAgentOrderTransactionSettingInput userAgentOrderTransactionSettingInput
        )
        {
            userAgentOrderTransactionSettingsRepository.SetCurrentUserId(currentUserService.CurrentUserId);
            return await userAgentOrderTransactionSettingsRepository.SaveOrderTransactionSettings(userAgentOrderTransactionSettingInput);
        }
    }
}
