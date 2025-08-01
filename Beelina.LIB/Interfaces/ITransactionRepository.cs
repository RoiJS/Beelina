﻿using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using Beelina.LIB.Dtos;

namespace Beelina.LIB.Interfaces
{
    public interface ITransactionRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<List<CustomerSale>> GetTopCustomerSales(int storeId, string fromDate, string toDate);
        Task<List<CustomerSaleProduct>> GetTopCustomerSaleProducts(int storeId);
        Task<Transaction> RegisterTransaction(Transaction transaction, List<ProductTransaction> deletedProductTransactions, CancellationToken cancellationToken = default);
        Task<Transaction> RegisterTransaction(Transaction transaction, List<int> deletedProductTransactionIds, CancellationToken cancellationToken = default);
        Task<Transaction> RegisterTransactionWithBusinessLogic(TransactionInput transactionInput, CancellationToken cancellationToken = default);
        Task<TransactionDetails> GetTransaction(int transactionId, bool includeProductDetails = true);
        Task<List<Transaction>> GetTransactions(List<int> transactionIds);
        Task<List<TransactionInformation>> GetTransactions(int userId, string filterKeyword = "", TransactionsFilter transactionsFilter = null);
        Task<bool> SendTransactionEmailReceipt(int transactionId);
        Task<List<TransactionDateInformation>> GetTransactonDates(TransactionStatusEnum status, string fromDate, string toDate);
        Task<List<TransactionInformation>> GetTransactionsByDate(TransactionStatusEnum status, string transactionDate);
        Task<TransactionSales> GetSales(int userId, string fromDate, string toDate);
        Task<double> GetBadOrderAmount(string transactionNo, int storeId, int? userId);
        Task<List<TotalSalesPerDateRange>> GetTotalSalePerDateRange(int userId, List<DateRange> dateRanges);
        Task<List<TransactionSalesPerSalesAgent>> GetSalesForAllSalesAgent(string fromDate, string toDate);
        Task DeleteOrderTransactions(List<int> transactionIds);
        Task<List<Transaction>> MarkTransactionsAsPaid(List<int> transactionIds, bool paid);
        Task<List<Transaction>> SetTransactionsStatus(List<int> transactionIds, TransactionStatusEnum status, bool markAsPaid, CancellationToken cancellationToken = default);
        Task<bool> SendInvoiceTransaction(int userId, int transactionId, IFile file);
        Task<List<InvalidProductTransactionOverallQuantitiesTransaction>> ValidateMultipleTransactionsProductQuantities(
            List<int> transactionIds, 
            int userAccountId, 
            IProductRepository<Product> productRepository,
            CancellationToken cancellationToken = default);
        Task<List<InvalidProductTransactionOverallQuantitiesTransaction>> ValidateProductTransactionsQuantities(
            List<TransactionInput> transactionInputs, 
            int userAccountId, 
            IProductRepository<Product> productRepository,
            CancellationToken cancellationToken = default);
    }
}
