using Beelina.LIB.DbContexts;
using Beelina.LIB.Enums;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Reports;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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
            var generalSetting = await _beelinaRepository
                                  .ClientDbContext
                                  .GeneralSettings
                                  .FirstOrDefaultAsync();

            var userRetailModulePermission = await _beelinaRepository
                .ClientDbContext
                .UserPermission
                .Where(u =>
                    u.ModuleId == ModulesEnum.Distribution
                    && u.UserAccountId == _currentUserService.CurrentUserId
                )
                .FirstOrDefaultAsync();

            var tenantId = await _beelinaRepository.SystemDbContext.Clients
                        .Where(c => c.DBHashName == _currentUserService.AppSecretToken)
                        .Select(c => c.Id)
                        .FirstOrDefaultAsync();

            var reportsFromRepo = await (from r in _beelinaRepository.SystemDbContext.Reports
                                         join rc in _beelinaRepository.SystemDbContext.ReportCustomerCustoms
                                         on new { Id = r.Id } equals new { Id = rc.ReportId }

                                         into reportCustomJoin
                                         from rc in reportCustomJoin.DefaultIfEmpty()

                                         where
                                           (!r.Custom || (r.Custom && rc.ClientId == tenantId && rc != null))
                                           && ((r.OnlyAvailableOnBusinessModel == null) || (r.OnlyAvailableOnBusinessModel != null && r.OnlyAvailableOnBusinessModel.Contains(Convert.ToInt32(generalSetting.BusinessModel).ToString())))
                                           && r.ModuleId == ModulesEnum.Distribution
                                           && r.UserMinimumModulePermission <= userRetailModulePermission.PermissionLevel
                                           && r.UserMaximumModulePermission >= userRetailModulePermission.PermissionLevel
                                           && r.IsActive
                                           && !r.IsDelete
                                         select r).ToListAsync();

            return reportsFromRepo;
        }

        public BeelinaClientDataContext BeelinaRepository()
        {
            return _beelinaRepository.ClientDbContext;
        }

        public async Task<GenerateReportResult> GenerateReport(int reportId, GenerateReportOptionEnum generateReportOption, List<ControlValues> controlValues)
        {
            var reportFromRepo = await GetReportInformation(reportId);
            var generateReportResult = new GenerateReportResult
            {
                GenerateReportOption = generateReportOption
            };

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
                var reportInstance = (IBaseReport<BaseReportOutput>)Activator.CreateInstance(constructedType, parameters);
                reportInstance
                .GenerateAsExcel();

                if (generateReportOption == GenerateReportOptionEnum.SendEmail)
                {
                    reportInstance.SendViaEmail(
                        _emailServerSettings.Value.SmtpAddress,
                        reportNotificationEmailAddress.EmailAddress,
                        _currentUserService.CurrrentUserEmailAddress,
                        _emailServerSettings.Value.SmtpAddress
                    );
                }

                if (generateReportOption == GenerateReportOptionEnum.Download)
                {
                    generateReportResult.ReportData = reportInstance.Download();
                }

            }
            catch (Exception e)
            {
                throw;
            }

            return generateReportResult;
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
