using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.GraphQL.Results
{
    public class ProductWarehouseStockReceiptEntryResult
        : ProductWarehouseStockReceiptEntry, IProductWarehouseStockReceiptEntryPayload
    {
        public List<ProductStockWarehouseAuditResult> ProductStockWarehouseAuditsResult { get; set; }

        public ProductWarehouseStockReceiptEntryResult()
        {
            ProductStockWarehouseAuditsResult = [];
        }
    }
}