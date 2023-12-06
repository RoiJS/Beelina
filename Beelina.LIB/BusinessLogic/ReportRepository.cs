using Beelina.LIB.DbContexts;
using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ReserbizAPP.LIB.Helpers.Class;
using ReserbizAPP.LIB.Helpers.Services;

namespace Beelina.LIB.BusinessLogic
{
    public class ReportRepository
        : BaseRepository<Report>, IReportRepository<Report>
    {
        private IUserAccountRepository<UserAccount> _userAccountRepository { get; }
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
            var userRetailModulePermission = await _beelinaRepository
                .ClientDbContext
                .UserPermission
                .Where(u =>
                    u.ModuleId == ModulesEnum.Retail
                    && u.UserAccountId == _currentUserService.CurrentUserId
                )
                .FirstOrDefaultAsync();

            var reportsFromRepo = await _beelinaRepository.SystemDbContext.Reports
                                    .Where(r =>
                                    r.ModuleId == ModulesEnum.Retail
                                    && r.UserMinimumModulePermission <= userRetailModulePermission.PermissionLevel
                                    && r.UserMaximumModulePermission >= userRetailModulePermission.PermissionLevel
                                ).ToListAsync();

            return reportsFromRepo;
        }

        public BeelinaClientDataContext BeelinaRepository()
        {
            return _beelinaRepository.ClientDbContext;
        }

        public async Task<Report> GenerateReport(int reportId, List<ControlValues> controlValues)
        {
            var reportFromRepo = await GetReportInformation(reportId);
            var reportNotificationEmailAddress = await GetReportNotificationEmailAddress(_currentUserService.CurrentUserId);
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
                    _currentUserService.CurrrentUserEmailAddress,
                    reportNotificationEmailAddress.EmailAddress,
                    _emailServerSettings.Value.SmtpAddress
                );
            }
            catch (Exception e)
            {
                throw;
            }

            return reportFromRepo;
        }

        public async Task<ReportNotificationEmailAddress> GetReportNotificationEmailAddress(int userAccountId)
        {
            var reportNotificationEmailAddress = await _beelinaRepository.ClientDbContext.ReportNotificationEmailAddresses
                                                .Where(r => r.UserAccountId == userAccountId)
                                                .FirstOrDefaultAsync();

            return reportNotificationEmailAddress;
        }

        public async Task RegisterNotificationEmailAddress(ReportNotificationEmailAddress reportNotificationEmailAddress)
        {
            if (reportNotificationEmailAddress.Id == 0)
            {
                await _beelinaRepository.ClientDbContext.ReportNotificationEmailAddresses.AddAsync(reportNotificationEmailAddress);
            }

            await _beelinaRepository.ClientDbContext.SaveChangesAsync();
        }
    }
}
