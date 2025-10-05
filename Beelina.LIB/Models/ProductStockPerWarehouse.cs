using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class ProductStockPerWarehouse
    : Entity, IUserActionTracker
    {
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public float PricePerUnit { get; set; }
        public float CostPrice { get; set; }
        public List<ProductStockWarehouseAudit> ProductStockWarehouseAudits { get; set; }
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

        public Product Product { get; set; }
        public Warehouse Warehouse { get; set; }

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