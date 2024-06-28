using Beelina.LIB.Enums;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Reports;

namespace Beelina.LIB.Interfaces
{
    public interface IReportRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Report> GetReportInformation(int reportId);
        Task<IList<Report>> GetAllReports();
        Task<GenerateReportResult> GenerateReport(int reportId, GenerateReportOptionEnum generateReportOption, List<ControlValues> controlValues);
        Task<ReportNotificationEmailAddress> GetReportNotificationEmailAddress(int userAccountId);
        Task RegisterNotificationEmailAddress(ReportNotificationEmailAddress reportNotificationEmailAddress);
    }
}
