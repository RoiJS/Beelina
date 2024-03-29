﻿using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class ProductStockPerPanel
        : Entity, IUserActionTracker
    {
        public int ProductId { get; set; }
        public int UserAccountId { get; set; }
        public int StockQuantity { get; set; }
        public float PricePerUnit { get; set; }
        public List<ProductStockAudit> ProductStockAudits { get; set; }

        public double Price
        {
            get
            {
                return Math.Round(PricePerUnit, 2);
            }
        }

        public Product Product { get; set; }
        public UserAccount UserAccount { get; set; }

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
