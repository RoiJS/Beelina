using System.Data;
using Beelina.LIB.Models.Reports;

namespace Beelina.LIB.Interfaces
{
    public interface IBaseReport<out TOutput> where TOutput : BaseReportOutput
    {
        IBaseReport<TOutput> GenerateAsExcel();
        DataSet GenerateReportData();
        void SendViaEmail(string sender, string receiver, string bcc);
    }
}