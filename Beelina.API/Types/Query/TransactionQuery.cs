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
    public async Task<IList<TransactionInformation>> GetTransactionsByDate([Service] ITransactionRepository<Transaction> transactionRepository, TransactionStatusEnum status, string transactionDate)
    {
      return await transactionRepository.GetTransactionsByDate(status, transactionDate);
    }

    [Authorize]
    public async Task<TransactionDetails> GetTransaction(
        [Service] ITransactionRepository<Transaction> transactionRepository,
        [Service] IProductTransactionRepository<ProductTransaction> productTransactionRepository,
        int transactionId)
    {
      var badOrdersAmount = 0.0;
      var transactionFromRepo = await transactionRepository
                      .GetEntity(transactionId)
                      .Includes(
                          t => t.Store,
                          t => t.Store.Barangay,
                          t => t.Store.PaymentMethod
                      )
                      .ToObjectAsync();

      // Only get for bad order amount if the transaction status is confirmed
      if (transactionFromRepo.Status == TransactionStatusEnum.Confirmed)
      {
        badOrdersAmount = await transactionRepository.GetBadOrderAmount(transactionFromRepo.InvoiceNo, transactionFromRepo.StoreId);
      }

      transactionFromRepo.ProductTransactions = await productTransactionRepository.GetProductTransactions(transactionId);

      return new TransactionDetails { Transaction = transactionFromRepo, BadOrderAmount = badOrdersAmount };
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

    [Authorize]
    public async Task<List<InsufficientProductQuantity>> ValidateProductionTransactionsQuantities(
            [Service] IProductRepository<Product> productRepository,
            List<ProductTransactionInput> productTransactionsInputs,
            int userAccountId)
    {
      var insufficientProductQuantities = new List<InsufficientProductQuantity>();
      var productsFromRepo = await productRepository.GetProducts(userAccountId, 0);

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

    [Authorize]
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
        var textOrderLines = texrOrder.ToLower().Split("*");

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
                Code = productFromRepo.Code,
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

    [Authorize]
    public async Task<List<TextProductInventoryDto>> AnalyzeTextInventories(
          [Service] IProductRepository<Product> productRepository,
          [Service] IProductStockPerPanelRepository<ProductStockPerPanel> productStockPerPanelRepository,
          int userAccountId,
          string textInventories)
    {

      var textInventoriesArray = textInventories.Split('\n');
      var textProductInventoryDto = new List<TextProductInventoryDto>();

      foreach (var textInventory in textInventoriesArray)
      {
        var textOrderLines = textInventory.Split(":");

        if (textOrderLines.Length > 1)
        {
          try
          {
            var productCode = textOrderLines[0].Trim();
            var productAdditionalQuantity = Convert.ToInt32(textOrderLines[1].Trim());
            var withdrawalSlipNo = textOrderLines.Length > 2 ? textOrderLines[2].Trim() : "";
            var productFromRepo = await productRepository.GetProductByCode(productCode);
            var productPerPanelFromRepo = await productStockPerPanelRepository.GetProductStockPerPanel(productFromRepo.Id, userAccountId);
            var price = textOrderLines.Length > 3 ? Convert.ToDouble(textOrderLines[3].Trim()) : (productPerPanelFromRepo != null ? productPerPanelFromRepo.PricePerUnit : 0.0);

            if (productFromRepo != null && (productAdditionalQuantity > 0 || productAdditionalQuantity < 0))
            {
              var textProductInventory = new TextProductInventoryDto
              {
                Id = productFromRepo.Id,
                Name = productFromRepo.Name,
                Code = productFromRepo.Code,
                Description = productFromRepo.Description,
                AdditionalQuantity = productAdditionalQuantity,
                Price = price,
                IsTransferable = productFromRepo.IsTransferable,
                NumberOfUnits = productFromRepo.NumberOfUnits,
                WithdrawalSlipNo = withdrawalSlipNo,
                ProductUnit = new ProductUnitDto
                {
                  Id = productFromRepo.ProductUnit.Id,
                  Name = productFromRepo.ProductUnit.Name
                }
              };

              textProductInventoryDto.Add(textProductInventory);
            }
          }
          catch (Exception e)
          {
            Console.WriteLine(e.Message);
          }
        }
      }

      return textProductInventoryDto;
    }
  }
}
