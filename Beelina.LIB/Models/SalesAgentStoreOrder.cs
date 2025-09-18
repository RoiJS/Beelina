namespace Beelina.LIB.Models
{
    /// <summary>
    /// Represents a sales agent and their associated store orders.
    /// </summary>
    public class SalesAgentStoreOrder
    {
        public int SalesAgentId { get; set; }
        public List<StoreOrder> StoreOrders { get; set; } = [];
    }
}