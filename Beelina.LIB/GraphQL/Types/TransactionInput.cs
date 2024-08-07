﻿using Beelina.LIB.Enums;

namespace Beelina.LIB.GraphQL.Types
{
    public class TransactionInput
    {
        public int Id { get; set; }
        public string InvoiceNo { get; set; }
        public double Discount { get; set; }
        public int StoreId { get; set; }
        public string TransactionDate { get; set; }
        public string DueDate { get; set; }
        public TransactionStatusEnum Status { get; set; }
        public int ModeOfPayment { get; set; }
        public bool Paid { get; set; }
        public List<ProductTransactionInput> ProductTransactionInputs { get; set; }
    }
}
