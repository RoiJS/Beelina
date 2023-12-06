using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Helpers.Extensions;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using ReserbizAPP.LIB.Helpers.Services;
using System.Data;
using System.Data.Common;

namespace Beelina.LIB.Models
{
    public class BaseReport<TOutput> where TOutput : class, new()
    {
        protected ReportRepository ReportRepository;

        protected int ReportId { get; set; }
        protected int UserId;
        protected Report Report { get; set; }
        protected List<ControlValues> ControlValues { get; set; }
        protected byte[] ExcelByteArray { get; set; }
        protected EmailService EmailService { get; }

        protected string BaseReportTemplateFormat { get; } = "xlsx";
        protected string BaseReportTemplatePath { get; } = "Templates/ReportTemplates";
        protected string BaseEmailTemplatePath { get; } = "Templates/EmailTemplates";
        protected string UserFullName { get; }

        protected string ReportTemplatePath
        {
            get
            {
                return String.Format("{0}/{1}/{2}_Template.{3}", AppDomain.CurrentDomain.BaseDirectory, BaseReportTemplatePath, Report.ReportClass, BaseReportTemplateFormat);
            }
        }


        public BaseReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
        {
            UserFullName = userFullName;
            EmailService = emailService;
            ReportRepository = reportRepository;

            ReportId = reportId;
            UserId = userId;
            ControlValues = controlValues;

            Report = ReportRepository.GetReportInformation(ReportId).Result;
        }

        public BaseReport()
        {

        }

        public DataSet GenerateReportData()
        {
            var spName = Report.StoredProcedureName;
            var spParams = new List<StoreProcedureParameters>();
            var dataSet = new DataSet();

            foreach (var control in ControlValues)
            {
                var reportParam = Report
                    .ReportControlsRelations
                    .Where(r => r.ReportControlId == control.ControlId)
                    .Select(r => r.ReportControl.ReportParameter)
                    .FirstOrDefault();

                spParams.Add(new StoreProcedureParameters { Name = reportParam.Name, Value = control.CurrentValue });
            }

            // Default SP parameter
            spParams.Add(new StoreProcedureParameters { Name = "userId", Value = UserId.ToString() });

            using (DbConnection connection = ReportRepository.BeelinaRepository().Database.GetDbConnection())
            {
                connection.Open();

                // Create a DbCommand to execute your SQL query
                using DbCommand command = connection.CreateCommand();
                command.CommandText = spName;
                command.CommandType = CommandType.StoredProcedure;

                foreach (var spParam in spParams)
                {
                    command.Parameters.Add(new SqlParameter($"@{spParam.Name}", spParam.Value));
                }

                using DbDataReader reader = command.ExecuteReader();
                // Loop through the result sets
                do
                {
                    // Create a DataTable for each result set
                    DataTable dataTable = new DataTable();
                    dataTable.Load(reader);

                    // Add the DataTable to the DataSet
                    dataSet.Tables.Add(dataTable);
                } while (!reader.IsClosed); // Move to the next result set if available
            }

            return dataSet;
        }

        public void SendViaEmail(string sender, string receiver, string cc, string bcc)
        {
            var reportPascalName = Report.ReportClass.AddSpacesToPascal();
            var fileName = $"{Report.ReportClass}_{DateTime.Now.ToString("yyyyMMddHHmmss")}";
            var subject = $"{reportPascalName} {DateTime.Now.ToString("MMM dd, yyyy")}";
            var emailContent = GenerateReportEmailContent();

            EmailService.SetFileAttachment(ExcelByteArray, $"{fileName}.xlsx");
            EmailService.Send(
                    sender,
                    receiver,
                    subject,
                    emailContent,
                    cc,
                    bcc
                );
        }

        protected string GenerateReportEmailContent()
        {
            var template = "";
            var reportName = Report.ReportClass.AddSpacesToPascal();

            using (var rdFile = new StreamReader(String.Format("{0}/{1}/EmailNotificationReportGeneration.html", AppDomain.CurrentDomain.BaseDirectory, BaseEmailTemplatePath)))
            {
                template = rdFile.ReadToEnd();
            }

            template = template.Replace("#customername", UserFullName);
            template = template.Replace("#reportname", reportName);
            template = template.Replace("#date", ReportRequestedDate());

            return template;
        }

        protected virtual string ReportRequestedDate()
        {
            var dateControl = ControlValues.Where(c => c.ControlId == 1).FirstOrDefault();
            if (dateControl is null) return String.Empty;
            return dateControl.CurrentValue;
        }
    }

    public struct StoreProcedureParameters
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }
}