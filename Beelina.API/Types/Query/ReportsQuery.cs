using AutoMapper;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class ReportsQuery
    {
        [Authorize]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Report>> GetReports([Service] IReportRepository<Report> reportRepository)
        {
            return await reportRepository.GetAllReports();
        }

        [Authorize]
        public async Task<IReportPayload> GetReportInformation([Service] IReportRepository<Report> reportRepository, [Service] IMapper mapper, int reportId)
        {
            var reportFromRepo = await reportRepository.GetReportInformation(reportId);
            var reportResult = mapper.Map<ReportInformationResult>(reportFromRepo);

            if (reportFromRepo == null)
            {
                return new ReportNotExistsError(reportId);
            }

            return reportResult;
        }

        [Authorize]
        public async Task<Report> GenerateReport(
                    [Service] IReportRepository<Report> reportRepository,
                    int reportId,
                    List<ControlValues> controlValues)
        {
            return await reportRepository.GenerateReport(reportId, controlValues);
        }

        [Authorize]
        public async Task<ReportNotificationEmailAddress> GetReportNotificationEmailAddress(
                    [Service] IReportRepository<Report> reportRepository,
                    [Service] ICurrentUserService currentUserService
        )
        {
            var reportEmailNotificationFromRepo = await reportRepository.GetReportNotificationEmailAddress(currentUserService.CurrentUserId);

            if (reportEmailNotificationFromRepo == null)
            {
                reportEmailNotificationFromRepo = new ReportNotificationEmailAddress() { EmailAddress = "" };
            }

            return reportEmailNotificationFromRepo;
        }
    }
}