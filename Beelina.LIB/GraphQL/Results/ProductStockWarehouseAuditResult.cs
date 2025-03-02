using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.GraphQL.Results
{
    public class ProductStockWarehouseAuditResult 
        : ProductStockWarehouseAudit
    {
        public int ProductId { get; set; }
    }
}