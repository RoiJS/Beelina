using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.GraphQL.Results
{
    public class ProductWithdrawalEntryResult
        : ProductWithdrawalEntry, IProductWithdrawalEntryPayload
    {
        public List<ProductWithdrawalAuditResult> ProductWithdrawalAuditsResult { get; set; }

        public ProductWithdrawalEntryResult()
        {
            ProductWithdrawalAuditsResult = [];
        }
    }
}