using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IReportRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Report> GetReportInformation(int reportId);
        Task<IList<Report>> GetAllReports();
        Task<Report> GenerateReport(int reportId, List<ControlValues> controlValues);
    }
}
