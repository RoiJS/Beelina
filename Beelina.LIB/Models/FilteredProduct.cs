using System;

namespace Beelina.LIB.Models
{
    public class FilteredProduct
    {
        public int Id { get; set; }
        public int ProductPerPanelId { get; set; }
        public int ProductPerWarehouseId { get; set; }
        public int WarehouseId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public int SearchResultPercentage { get; set; }
        public int NumberOfUnits { get; set; }
        public string Description { get; set; }
        public float PricePerUnit { get; set; }
        public int ProductUnitId { get; set; }
        public ProductUnit ProductUnit { get; set; }
        public int SupplierId { get; set; }
        public Supplier Supplier { get; set; }
        public bool IsTransferable { get; set; }
        public bool IsLinkedToSalesAgent { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public bool Parent { get; set; }
        public int? ProductParentGroupId { get; set; }
    }
}