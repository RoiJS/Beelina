namespace Beelina.LIB.GraphQL.Types
{
    public class StoreInput
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public PaymentMethodInput PaymentMethodInput { get; set; }
    }
}
