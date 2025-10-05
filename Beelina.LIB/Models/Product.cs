using System.ComponentModel.DataAnnotations.Schema;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class Product
        : Entity, IUserActionTracker
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int StockQuantity { get; set; }
        public float PricePerUnit { get; set; }
        public float CostPrice { get; set; }
        public bool IsTransferable { get; set; }
        public int NumberOfUnits { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public bool Parent { get; set; }
        public int? ProductParentGroupId { get; set; }
        public virtual Product ProductParentGroup { get; set; }

        [NotMapped]
        public bool IsLinkedToSalesAgent { get; set; }
        [NotMapped]
        public double SearchResultPercentage { get; set; }

        public double Price
        {
            get
            {
                return Math.Round(PricePerUnit, 2);
            }
        }

        public double Cost
        {
            get
            {
                return Math.Round(CostPrice, 2);
            }
        }

        [NotMapped]
        public bool IsCurrentlyActive
        {
            get
            {
                DateTime now = DateTime.UtcNow.Date;
                return ValidFrom <= now && (!ValidTo.HasValue || ValidTo > now);
            }
        }

        public int ProductUnitId { get; set; }
        public ProductUnit ProductUnit { get; set; }

        public int SupplierId { get; set; }
        public Supplier Supplier { get; set; }

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
