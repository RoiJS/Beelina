namespace Beelina.LIB.Dtos
{
    public class InsufficientProductQuantity
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public int SelectedQuantity { get; set; }
        public int CurrentQuantity { get; set; }

        public InsufficientProductQuantity()
        {

        }
    }
}