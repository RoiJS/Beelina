using Beelina.LIB.Dtos;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class UserAgentOrderTransactionSettingsRepository(
        IBeelinaRepository<UserSetting> beelinaRepository,
        IUserSettingsRepository<UserSetting> userSettingsRepository)
                : BaseRepository<UserSetting>(beelinaRepository, beelinaRepository.ClientDbContext),
                IUserAgentOrderTransactionSettingsRepository<UserSetting>
    {
        private readonly IUserSettingsRepository<UserSetting> userSettingsRepository = userSettingsRepository;

        /// <summary>
        /// Retrieves the order transaction settings for a specified user.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose order transaction settings are to be retrieved.</param>
        /// <returns>A <see cref="UserAgentOrderTransactionSettingsDto"/> containing the user's order transaction settings.</returns>
        public async Task<UserAgentOrderTransactionSettingsDto> GetOrderTransactionSettings(int userId)
        {
            var userAgentOrderTransactionSettingsDto = new UserAgentOrderTransactionSettingsDto();
            var userSettingsFromRepo = await userSettingsRepository.GetUserSettings(userId);
            userAgentOrderTransactionSettingsDto.AllowSendReceipt = userSettingsFromRepo.AllowSendReceipt;
            userAgentOrderTransactionSettingsDto.AllowAutoSendReceipt = userSettingsFromRepo.AllowAutoSendReceipt;
            userAgentOrderTransactionSettingsDto.SendReceiptEmailAddress = userSettingsFromRepo.SendReceiptEmailAddress;
            userAgentOrderTransactionSettingsDto.AllowPrintReceipt = userSettingsFromRepo.AllowPrintReceipt;
            userAgentOrderTransactionSettingsDto.AutoPrintReceipt = userSettingsFromRepo.AutoPrintReceipt;
            userAgentOrderTransactionSettingsDto.PrintReceiptFontSize = userSettingsFromRepo.PrintReceiptFontSize;

            return userAgentOrderTransactionSettingsDto;
        }

        /// <summary>
        /// Saves the user's order transaction settings based on the provided input.
        /// </summary>
        /// <param name="userAgentOrderTransactionSettingInput">The input containing updated order transaction settings for the user.</param>
        /// <returns>True if the settings were saved successfully; otherwise, false.</returns>
        public async Task<bool> SaveOrderTransactionSettings(UserAgentOrderTransactionSettingInput userAgentOrderTransactionSettingInput)
        {
            try
            {
                var userSettingsFromRepo = await userSettingsRepository.GetUserSettings(userAgentOrderTransactionSettingInput.UserId);
                userSettingsFromRepo.AllowSendReceipt = userAgentOrderTransactionSettingInput.AllowSendReceipt;
                userSettingsFromRepo.AllowAutoSendReceipt = userAgentOrderTransactionSettingInput.AllowAutoSendReceipt;
                userSettingsFromRepo.SendReceiptEmailAddress = userAgentOrderTransactionSettingInput.SendReceiptEmailAddress;
                userSettingsFromRepo.AllowPrintReceipt = userAgentOrderTransactionSettingInput.AllowPrintReceipt;
                userSettingsFromRepo.AutoPrintReceipt = userAgentOrderTransactionSettingInput.AutoPrintReceipt;
                userSettingsFromRepo.PrintReceiptFontSize = userAgentOrderTransactionSettingInput.PrintReceiptFontSize;
                await userSettingsRepository.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving user order transaction setting: {ex.Message}");
                return false;
            }
        }
    }
}
