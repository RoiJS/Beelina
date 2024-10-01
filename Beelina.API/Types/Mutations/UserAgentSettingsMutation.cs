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
            [Service] ILogger<UserAgentSettingsMutation> logger,
            [Service] IUserAgentOrderTransactionSettingsRepository<UserSetting> userAgentOrderTransactionSettingsRepository,
            [Service] ICurrentUserService currentUserService,
            UserAgentOrderTransactionSettingInput userAgentOrderTransactionSettingInput
        )
        {
            try
            {
                userAgentOrderTransactionSettingsRepository.SetCurrentUserId(currentUserService.CurrentUserId);
                var result = await userAgentOrderTransactionSettingsRepository.SaveOrderTransactionSettings(userAgentOrderTransactionSettingInput);

                logger.LogInformation("Successfully save user agent order transaction settings. Params: {@params}", new
                {
                    userAgentOrderTransactionSettingInput
                });

                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to save user agent order transaction settings. Params: {@params}", new
                {
                    userAgentOrderTransactionSettingInput
                });

                throw new Exception($"Failed to save user agent order transaction settings. {ex.Message}");
            }
        }
    }
}
