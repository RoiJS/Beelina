using Beelina.LIB.Interfaces;

namespace Beelina.LIB.GraphQL.Errors
{
    public class ReportNotExistsError
        : BaseError, IReportPayload
    {
        public ReportNotExistsError(int reportId)
        {
            Message = $"Report with the id of {reportId} does not exists!";
        }
    }
}
