
namespace Beelina.LIB.Models
{
    public class ReportCustomerCustom
        : Entity
    {
        public int ReportId { get; set; }
        public int ClientId { get; set; }

        public Report Report { get; set; }
        public Client Client { get; set; }
    }
}