namespace Beelina.LIB.GraphQL.Types
{
    public class StoreInput
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public PaymentMethodInput PaymentMethodInput { get; set; }
        public BarangayInput BarangayInput { get; set; }
    }
}
