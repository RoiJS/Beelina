using Beelina.LIB.Dtos;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
  [ExtendObjectType("Query")]
  public class TransactionQuery
  {
    [Authorize]
    [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public async Task<IList<TransactionDateInformation>> GetTransactionDates([Service] ITransactionRepository<Transaction> transactionRepository, TransactionStatusEnum transactionStatus, string? fromDate, string? toDate)
    {
      return await transactionRepository.GetTransactonDates(transactionStatus, fromDate, toDate);
    }

    [Authorize]
    public async Task<IList<Transaction>> GetTransactionsByDate([Service] ITransactionRepository<Transaction> transactionRepository, TransactionStatusEnum status, string transactionDate)
    {
      return await transactionRepository.GetTransactionByDate(status, transactionDate);
    }

    [Authorize]
    public async Task<Transaction> GetTransaction(
        [Service] ITransactionRepository<Transaction> transactionRepository,
        [Service] IProductTransactionRepository<ProductTransaction> productTransactionRepository,
        int transactionId)
    {
      var transactionFromRepo = await transactionRepository
                      .GetEntity(transactionId)
                      .Includes(
                          t => t.Store,
                          t => t.Store.Barangay,
                          t => t.Store.PaymentMethod
                      )
                      .ToObjectAsync();

      transactionFromRepo.ProductTransactions = await productTransactionRepository.GetProductTransactions(transactionId);

      return transactionFromRepo;
    }

    [Authorize]
    public async Task<List<TransactionTopProduct>> GetTopProducts([Service] IProductTransactionRepository<ProductTransaction> productTransactionRepository)
    {
      return await productTransactionRepository.GetTopProducts();
    }

    [Authorize]
    public async Task<TransactionSales> GetTransactionSales([Service] ITransactionRepository<Transaction> transactionRepository, string fromDate, string toDate)
    {
      return await transactionRepository.GetSales(fromDate, toDate);
    }

    public async Task<List<InsufficientProductQuantity>> ValidateProductionTransactionsQuantities(
        [Service] IProductRepository<Product> productRepository,
        [Service] ICurrentUserService currentUserService,
        List<ProductTransactionInput> productTransactionsInputs)
    {
      var insufficientProductQuantities = new List<InsufficientProductQuantity>();
      var productsFromRepo = await productRepository.GetProducts(currentUserService.CurrentUserId, 0);

      foreach (Product product in productsFromRepo)
      {
        foreach (ProductTransactionInput productTransaction in productTransactionsInputs)
        {
          if (product.Id == productTransaction.ProductId && productTransaction.Quantity > product.StockQuantity)
          {
            var insufficientProductQuantity = new InsufficientProductQuantity
            {
              ProductId = product.Id,
              ProductName = product.Name,
              ProductCode = product.Code,
              SelectedQuantity = productTransaction.Quantity,
              CurrentQuantity = product.StockQuantity
            };

            insufficientProductQuantities.Add(insufficientProductQuantity);
          }
        }
      }

      return insufficientProductQuantities;
    }

    public async Task<List<ProductTransactionDto>> AnalyzeTextOrders(
      [Service] IProductRepository<Product> productRepository,
      [Service] IProductStockPerPanelRepository<ProductStockPerPanel> productStockPerPanelRepository,
      [Service] ICurrentUserService currentUserService,
        string textOrders)
    {

      var textOrdersArray = textOrders.Split('\n');
      var productTransactionsDto = new List<ProductTransactionDto>();

      foreach (var texrOrder in textOrdersArray)
      {
        var textOrderLines = texrOrder.ToLower().Split("x");

        if (textOrderLines.Length > 1)
        {
          try
          {
            var productCode = textOrderLines[0].Trim();
            var productQuantity = Convert.ToInt32(textOrderLines[1].Trim());
            var productFromRepo = await productRepository.GetProductByCode(productCode);
            var productPerPanelFromRepo = await productStockPerPanelRepository.GetProductStockPerPanel(productFromRepo.Id, currentUserService.CurrentUserId);

            if (productFromRepo != null && productPerPanelFromRepo != null)
            {
              var productTransaction = new ProductTransactionDto
              {
                Id = 0,
                ProductId = productFromRepo.Id,
                ProductName = productFromRepo.Name,
                Price = productPerPanelFromRepo.Price,
                Quantity = productQuantity,
                CurrentQuantity = 0,
              };

              productTransactionsDto.Add(productTransaction);
            }
          }
          catch (Exception e)
          {
            Console.WriteLine(e.Message);
          }
        }
      }

      return productTransactionsDto;
    }
  }
}
