using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class ReportMutation
    {
        [Authorize]
        public async Task<ReportNotificationEmailAddress> UpdateReportNotificationEmailAddress(
            [Service] IReportRepository<Report> reportRepository,
            [Service] ICurrentUserService currentUserService,
            string emailAddress
        )
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

            return reportFromRepo;
        }
    }
}