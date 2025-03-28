using Beelina.LIB.Models;

namespace Beelina.LIB.GraphQL.Results
{
    public class ProductWithdrawalAuditResult 
        : ProductStockAudit
    {
        public int ProductId { get; set; }
    }
}