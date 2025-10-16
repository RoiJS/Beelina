using Beelina.LIB.Interfaces;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;

namespace Beelina.LIB.Models
{
    public class ProductWithdrawalEntry
    : Entity, IUserActionTracker
    {
        public int? UserAccountId { get; set; }
        public DateTime? StockEntryDate { get; set; }
        public string WithdrawalSlipNo { get; set; }
        public string Notes { get; set; }

        public List<ProductStockAudit> ProductStockAudits { get; set; }

        public virtual UserAccount UserAccount { get; set; }

        [NotMapped]
        public double TotalAmount { get; set; }

        [NotMapped]
        public string FormattedTotalAmount
        {
            get
            {
                return TotalAmount.ToString("C", new CultureInfo("en-PH"));
            }
        }

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