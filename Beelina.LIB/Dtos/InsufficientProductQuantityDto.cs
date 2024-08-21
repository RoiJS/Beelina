namespace Beelina.LIB.Dtos
{
    public class InsufficientProductQuantity
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public int SelectedQuantity { get; set; }
        public int CurrentQuantity { get; set; }

        public List<InsufficientProductTransaction> InsufficientProductTransactions { get; set; }

        public InsufficientProductQuantity()
        {
            InsufficientProductTransactions = [];
        }
    }

    public class InsufficientProductTransaction
    {
        public int TransactionId { get; set; }
        public string TransationCode { get; set; }
    }

    public class ProductTransactionOverallQuantities
    {
        public int ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public int CurrentQuantity { get; set; }
        public int OverallQuantity { get; set; }

        public List<ProductTransactionOverallQuantitiesTransaction> ProductTransactionOverallQuantitiesTransactions { get; set; }

        public ProductTransactionOverallQuantities()
        {
            ProductTransactionOverallQuantitiesTransactions = [];
        }
    }

    public class ProductTransactionOverallQuantitiesTransaction
    {
        public int TransactionId { get; set; }
        public string TransactionCode { get; set; }
    }

    public class InvalidProductTransactionOverallQuantitiesTransaction
        : ProductTransactionOverallQuantitiesTransaction
    {
        public List<InvalidProductTransactionOverallQuantities> InvalidProductTransactionOverallQuantities { get; set; }

        public InvalidProductTransactionOverallQuantitiesTransaction()
            : base()
        {
            InvalidProductTransactionOverallQuantities = [];
        }
    }

    public class InvalidProductTransactionOverallQuantities
        : ProductTransactionOverallQuantities
    {
        public InvalidProductTransactionOverallQuantities() : base()
        {

        }
    }
}