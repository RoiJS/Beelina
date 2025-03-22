namespace Beelina.LIB.GraphQL.Types
{
    public class ProductWithdrawalEntryInput
    {
        public int Id { get; set; }
        public int UserAccountId { get; set; }
        public string StockEntryDate { get; set; }
        public string WithdrawalSlipNo { get; set; }
        public string Notes { get; set; }
        public List<ProductStockAuditInput> ProductStockAudits { get; set; }
    }
}
