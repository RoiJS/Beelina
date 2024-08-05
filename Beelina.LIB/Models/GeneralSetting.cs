using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class GeneralSetting
        : Entity, IUserActionTracker
    {
        public BusinessModelEnum BusinessModel { get; set; }
        public bool ByPassAuthentication { get; set; }
        public bool SendOrderTransactionReceipt { get; set; } = true;
        public string CompanyName { get; set; }
        public string Address { get; set; }
        public string OwnerName { get; set; }
        public string Telephone { get; set; }
        public string FaxTelephone { get; set; }
        public string Tin { get; set; }
        public string InvoiceFooterText { get; set; }
        public string InvoiceFooterText1 { get; set; }
        public int? DeletedById { get; set; }
        public virtual UserAccount DeletedBy { get; set; }
        public int? UpdatedById { get; set; }
        public virtual UserAccount UpdatedBy { get; set; }
        public int? CreatedById { get; set; }
        public virtual UserAccount CreatedBy { get; set; }
        public int? DeactivatedById { get; set; }
        public virtual UserAccount DeactivatedBy { get; set; }
    }
}