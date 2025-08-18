using System;

namespace Beelina.LIB.GraphQL.Types
{
    public class ProductInput
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int StockQuantity { get; set; }
        public float PricePerUnit { get; set; }
        public string WithdrawalSlipNo { get; set; }
        public string PlateNo { get; set; }
        public bool IsTransferable { get; set; }
        public int NumberOfUnits { get; set; }
        public int SupplierId { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public bool Parent { get; set; }
        public int? ProductParentGroupId { get; set; }
        public ProductUnitInput ProductUnitInput { get; set; }
    }
}
