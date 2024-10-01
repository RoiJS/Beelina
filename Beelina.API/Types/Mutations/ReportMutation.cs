using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class ReportMutation
    {
        [Authorize]
        public async Task<ReportNotificationEmailAddress> UpdateReportNotificationEmailAddress(
            [Service] ILogger<ReportMutation> logger,
            [Service] IReportRepository<Report> reportRepository,
            [Service] ICurrentUserService currentUserService,
            string emailAddress
        )
        {
            try
            {
                var reportFromRepo = await reportRepository.GetReportNotificationEmailAddress(currentUserService.CurrentUserId);

                if (reportFromRepo != null)
                {
                    reportFromRepo.EmailAddress = emailAddress;
                }
                else
                {
                    reportFromRepo = new ReportNotificationEmailAddress
                    {
                        UserAccountId = currentUserService.CurrentUserId,
                        EmailAddress = emailAddress
                    };
                }

                await reportRepository.RegisterNotificationEmailAddress(reportFromRepo);

                logger.LogInformation("Successfully updated report notification email address. Params: {@params}", new
                {
                    emailAddress
                });

                return reportFromRepo;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update report notification email address. Params: {@params}", new
                {
                    emailAddress
                });

                throw new Exception($"Failed to update report notification email address. {ex.Message}");
            }
        }
    }
}