using Beelina.LIB.DbContexts;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Reports;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ReserbizAPP.LIB.Helpers.Class;
using ReserbizAPP.LIB.Helpers.Services;

namespace Beelina.LIB.BusinessLogic
{
    public class ReportRepository
        : BaseRepository<Report>, IReportRepository<Report>
    {
        private ICurrentUserService _currentUserService;

        private IOptions<EmailServerSettings> _emailServerSettings { get; }

        public ReportRepository(
            IBeelinaRepository<Report> beelinaRepository,
            IOptions<EmailServerSettings> emailServerSettings,
            ICurrentUserService currentUserService
            )
            : base(beelinaRepository, beelinaRepository.SystemDbContext)
        {
            _emailServerSettings = emailServerSettings;
            _currentUserService = currentUserService;
        }

        public async Task<Report> GetReportInformation(int reportId)
        {

            var reportFromRepo = await _beelinaRepository.SystemDbContext.Reports
                                .Where(r => r.Id == reportId)
                                .Include(r => r.ReportControlsRelations)
                                .ThenInclude(r => r.ReportControl)
                                .ThenInclude(r => r.ReportParameter)
                                .FirstOrDefaultAsync();

            return reportFromRepo;
        }

        public async Task<IList<Report>> GetAllReports()
        {
            var reportsFromRepo = await GetAllEntities().ToListObjectAsync();
            return reportsFromRepo;
        }

        public BeelinaClientDataContext BeelinaRepository()
        {
            return _beelinaRepository.ClientDbContext;
        }

        public async Task<Report> GenerateReport(int reportId, List<ControlValues> controlValues)
        {
            var reportFromRepo = await GetReportInformation(reportId);

            var emailReceiver = _currentUserService.CurrrentUserEmailAddress;
            var userFullName = _currentUserService.CurrrentName;

            var reportName = reportFromRepo.ReportClass;
            var emailService = new EmailService(_emailServerSettings.Value.SmtpServer,
                                _emailServerSettings.Value.SmtpAddress,
                                _emailServerSettings.Value.SmtpPassword,
                                _emailServerSettings.Value.SmtpPort);

            var constructedType = Type.GetType(string.Format("Beelina.LIB.Models.Reports.{0}`1[Beelina.LIB.Models.Reports.{0}Output]", reportName));

            // Create an array of parameter values
            object[] parameters = new object[] { reportId, _currentUserService.CurrentUserId, userFullName, controlValues, emailService, this };

            try
            {
                // Create an instance of the class
                var instance = (IBaseReport<BaseReportOutput>)Activator.CreateInstance(constructedType, parameters);
                instance
                .GenerateAsExcel()
                .SendViaEmail(
                    _emailServerSettings.Value.SmtpAddress,
                    emailReceiver,
                    _emailServerSettings.Value.SmtpAddress
                );
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }

            return reportFromRepo;
        }
    }

}
