using AutoMapper;
using Beelina.LIB.Dtos;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;
using Beelina.LIB.Models.Filters;
using System.Runtime.InteropServices.Marshalling;

namespace Beelina.API.Types.Query
{
	[ExtendObjectType("Query")]
	public class TransactionQuery
	{
		[Authorize]
		public async Task<Transaction> RegisterTransaction(
		  [Service] ILogger<TransactionQuery> logger,
		  [Service] ITransactionRepository<Transaction> transactionRepository,
		  [Service] ICurrentUserService currentUserService,
		  [Service] IHttpContextAccessor httpContextAccessor,
		  [Service] IMapper mapper,
		  TransactionInput transactionInput)
		{

			try
			{
				logger.LogInformation("Start Transaction - Register Transaction");
				logger.LogInformation("=================================================================================");

				transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);

				var transactionFromRepo = (await transactionRepository.GetTransaction(transactionInput.Id)).Transaction;

				if (transactionFromRepo == null)
				{
					transactionFromRepo = mapper.Map<Transaction>(transactionInput);

					logger.LogInformation("Part 1 - Creating new Transaction... {@transactionInput}", transactionInput);
				}
				else
				{
					mapper.Map(transactionInput, transactionFromRepo);

					logger.LogInformation("Part 1 - Updating existing Transaction... {@transactionInput}", transactionInput);
				}

				var updatedProductTransactions = mapper.Map<List<ProductTransaction>>(transactionInput.ProductTransactionInputs);

				logger.LogInformation("Part 2 - Setting up product transactions history...");

				updatedProductTransactions.ForEach(t =>
				{
					var productQuantityHistories = new List<ProductTransactionQuantityHistory>();

					if (t.Id > 0)
					{
						productQuantityHistories = transactionFromRepo
								.ProductTransactions
								.Where(pt => pt.ProductId == t.ProductId)
								.Select(pt => pt.ProductTransactionQuantityHistory)
								.First();

						var productTransactionFromInput = transactionInput
								.ProductTransactionInputs
								.Where(pt => pt.ProductId == t.ProductId)
								.First();

						if (productTransactionFromInput.CurrentQuantity != productTransactionFromInput.Quantity)
						{
							productQuantityHistories.Add(new ProductTransactionQuantityHistory
							{
								ProductTransactionId = t.Id,
								Quantity = productTransactionFromInput.CurrentQuantity
							});
						}
					}

					t.Status = !transactionInput.Paid ? PaymentStatusEnum.Unpaid : PaymentStatusEnum.Paid;

					if (productQuantityHistories.Count > 0)
					{
						t.ProductTransactionQuantityHistory = productQuantityHistories;
					}
				});

				logger.LogInformation("Part 3 - Checking deleted product transactions...");

				var deletedProductTransactions = transactionFromRepo.ProductTransactions
					.Where(ptRepo => !transactionInput.ProductTransactionInputs.Any(ptInput => ptInput.Id == ptRepo.Id))
					.ToList();

				transactionFromRepo.ProductTransactions = updatedProductTransactions;

				// Register Payment
				if (transactionInput.Paid &&
				  transactionInput.Status == TransactionStatusEnum.Confirmed &&
				  transactionFromRepo.Payments.Count == 0)
				{
					logger.LogInformation("Part 4 - Auto-payment registration...");

					var newPayment = new Payment();
					newPayment.Amount = transactionFromRepo.NetTotal;
					newPayment.PaymentDate = transactionFromRepo.TransactionDate
								.AddHours(DateTime.Now.Hour)
								.AddMinutes(DateTime.Now.Minute)
								.AddSeconds(DateTime.Now.Second);
					newPayment.Notes = "Automatic Payment Registration";
					transactionFromRepo.Payments.Add(newPayment);
				}

				await transactionRepository.RegisterTransaction(transactionFromRepo, deletedProductTransactions, httpContextAccessor.HttpContext.RequestAborted);

				if (transactionInput.Id > 0)
				{
					logger.LogInformation("Successfully update transaction. Params: {@params}", new
					{
						transactionInput
					});
				}
				else
				{
					logger.LogInformation("Successfully register transaction. Params: {@params}", new
					{
						transactionInput
					});
				}

				logger.LogInformation("End of transaction");
				logger.LogInformation("=================================================================================");

				return transactionFromRepo;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Failed to register/update transaction. Params: {@params}", new
				{
					transactionInput
				});
				logger.LogInformation("=================================================================================");

				throw new Exception($"Failed to register/update transaction. {ex.Message}");
			}

		}

		[Authorize]
		public async Task<List<Transaction>> RegisterTransactions(
			[Service] ILogger<TransactionQuery> logger,
			[Service] ITransactionRepository<Transaction> transactionRepository,
			[Service] ICurrentUserService currentUserService,
			[Service] IHttpContextAccessor httpContextAccessor,
			[Service] IMapper mapper,
			List<TransactionInput> transactionInputs)
		{

			List<Transaction> savedTransactions = [];
			transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);

			foreach (var transactionInput in transactionInputs)
			{
				try
				{
					var transactionFromRepo = (await transactionRepository.GetTransaction(transactionInput.Id)).Transaction;

					if (transactionFromRepo == null)
					{
						transactionFromRepo = mapper.Map<Transaction>(transactionInput);
					}
					else
					{
						mapper.Map(transactionInput, transactionFromRepo);
					}

					var updatedProductTransactions = mapper.Map<List<ProductTransaction>>(transactionInput.ProductTransactionInputs);

					updatedProductTransactions.ForEach(t =>
					{
						var productQuantityHistories = new List<ProductTransactionQuantityHistory>();

						if (t.Id > 0)
						{
							productQuantityHistories = transactionFromRepo
								.ProductTransactions
								.Where(pt => pt.ProductId == t.ProductId)
								.Select(pt => pt.ProductTransactionQuantityHistory)
								.First();

							var productTransactionFromInput = transactionInput
								.ProductTransactionInputs
								.Where(pt => pt.ProductId == t.ProductId)
								.First();

							if (productTransactionFromInput.CurrentQuantity != productTransactionFromInput.Quantity)
							{
								productQuantityHistories.Add(new ProductTransactionQuantityHistory
								{
									ProductTransactionId = t.Id,
									Quantity = productTransactionFromInput.CurrentQuantity
								});
							}
						}

						t.Status = !transactionInput.Paid ? PaymentStatusEnum.Unpaid : PaymentStatusEnum.Paid;

						if (productQuantityHistories.Count > 0)
						{
							t.ProductTransactionQuantityHistory = productQuantityHistories;
						}
					});

					var deletedProductTransactions = transactionFromRepo.ProductTransactions
						.Where(ptRepo => !transactionInput.ProductTransactionInputs.Any(ptInput => ptInput.Id == ptRepo.Id))
						.ToList();

					transactionFromRepo.ProductTransactions = updatedProductTransactions;

					// Register Payment
					if (transactionInput.Paid &&
					  transactionInput.Status == TransactionStatusEnum.Confirmed &&
					  transactionFromRepo.Payments.Count == 0)
					{
						var newPayment = new Payment();
						newPayment.Amount = transactionFromRepo.NetTotal;
						newPayment.PaymentDate = transactionFromRepo.TransactionDate
									.AddHours(DateTime.Now.Hour)
									.AddMinutes(DateTime.Now.Minute)
									.AddSeconds(DateTime.Now.Second);
						newPayment.Notes = "Automatic Payment Registration";
						transactionFromRepo.Payments.Add(newPayment);
					}

					await transactionRepository.RegisterTransaction(transactionFromRepo, deletedProductTransactions, httpContextAccessor.HttpContext.RequestAborted);

					if (transactionInput.Id > 0)
					{
						logger.LogInformation("Successfully update transaction. Params: {@params}", new
						{
							transactionInput
						});
					}
					else
					{
						logger.LogInformation("Successfully register transaction. Params: {@params}", new
						{
							transactionInput
						});
					}

					savedTransactions.Add(transactionFromRepo);
				}
				catch (Exception ex)
				{
					logger.LogError(ex, "Failed to register/update transaction. Params: {@params}", new
					{
						transactionInput
					});
				}
			}

			return savedTransactions;
		}

		[Authorize]
		[UsePaging(MaxPageSize = 50, DefaultPageSize = 50, IncludeTotalCount = true)]
		[UseProjection]
		[UseFiltering]
		[UseSorting]
		public async Task<List<TransactionInformation>> GetTransactions([Service] ITransactionRepository<Transaction> transactionRepository, string filterKeyword = "", TransactionsFilter transactionsFilter = null)
		{
			return await transactionRepository.GetTransactions(0, filterKeyword, transactionsFilter);
		}

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
			int transactionId)
		{
			return await transactionRepository.GetTransaction(transactionId);
		}

		[Authorize]
		public async Task<bool> SendTransactionEmailReceipt(
			[Service] ITransactionRepository<Transaction> transactionRepository,
			[Service] IGeneralSettingRepository<GeneralSetting> generalSettingRepository,
			int transactionId)
		{
			var result = true;
			var generalSetting = await generalSettingRepository.GetGeneralSettings();

			// Check if order transaction receipt should be sent
			if (generalSetting.SendOrderTransactionReceipt)
			{
				result = await transactionRepository.SendTransactionEmailReceipt(transactionId);
			}

			return result;
		}

		[Authorize]
		[UsePaging(MaxPageSize = 50, DefaultPageSize = 50, IncludeTotalCount = true)]
		[UseProjection]
		[UseFiltering]
		[UseSorting]
		public async Task<List<TransactionTopProduct>> GetTopSellingProducts([Service] IProductTransactionRepository<ProductTransaction> productTransactionRepository, int userId, string? fromDate, string? toDate)
		{
			return await productTransactionRepository.GetTopSellingProducts(userId, fromDate, toDate);
		}

		[Authorize]
		public async Task<TransactionSales> GetTransactionSales([Service] ITransactionRepository<Transaction> transactionRepository, int userId, string fromDate, string toDate)
		{
			return await transactionRepository.GetSales(userId, fromDate, toDate);
		}

		[Authorize]
		public async Task<List<TransactionSalesPerSalesAgent>> GetSalesForAllSalesAgent([Service] ITransactionRepository<Transaction> transactionRepository, string fromDate, string toDate)
		{
			return await transactionRepository.GetSalesForAllSalesAgent(fromDate, toDate);
		}

		[Authorize]
		public async Task<List<TotalSalesPerDateRange>> GetTransactionSalesPerDateRange([Service] ITransactionRepository<Transaction> transactionRepository, int userId, List<DateRange> dateRanges)
		{
			return await transactionRepository.GetTotalSalePerDateRange(userId, dateRanges);
		}

		[Authorize]
		public async Task<List<CustomerSale>> GetTopCustomerSales([Service] ITransactionRepository<Transaction> transactionRepository, int storeId, string fromDate, string toDate)
		{
			return await transactionRepository.GetTopCustomerSales(storeId, fromDate, toDate);
		}

		[Authorize]
		public async Task<List<CustomerSaleProduct>> GetCustomerSaleProducts([Service] ITransactionRepository<Transaction> transactionRepository, int storeId)
		{
			return await transactionRepository.GetTopCustomerSaleProducts(storeId);
		}

		[Authorize]
		public async Task<List<InvalidProductTransactionOverallQuantitiesTransaction>> ValidateMutlipleTransactionsProductQuantities(
		  [Service] IProductRepository<Product> productRepository,
		  [Service] ITransactionRepository<Transaction> transactionRepository,
		  [Service] IHttpContextAccessor httpContextAccessor,
		  [Service] IMapper mapper,
		  List<int> transactionIds,
		  int userAccountId
		)
		{
			var transactions = await transactionRepository.GetTransactions(transactionIds);
			var transactionInputs = mapper.Map<List<TransactionInput>>(transactions);
			transactionInputs.ForEach(transactionInput =>
			{
				var transaction = transactions.Where(t => t.Id == transactionInput.Id).FirstOrDefault();
				if (transaction is not null)
				{
					transactionInput.ProductTransactionInputs = mapper.Map<List<ProductTransactionInput>>(transaction.ProductTransactions);
				}
			});

			var invalidProductTransactionOverallQuantities = await ValidateProductionTransactionsQuantities(
															  productRepository,
															  httpContextAccessor,
															  transactionInputs,
															  userAccountId
															);

			return invalidProductTransactionOverallQuantities;
		}

		[Authorize]
		public async Task<List<InvalidProductTransactionOverallQuantitiesTransaction>> ValidateProductionTransactionsQuantities(
				[Service] IProductRepository<Product> productRepository,
				[Service] IHttpContextAccessor httpContextAccessor,
				List<TransactionInput> transactionInputs,
				int userAccountId)
		{
			var insufficientProductQuantities = new List<InsufficientProductQuantity>();
			var productsFromRepo = await productRepository.GetProducts(userAccountId, 0, "", null, httpContextAccessor.HttpContext.RequestAborted);

			List<ProductTransactionOverallQuantities> allProductTransactionOverallQuantities = [];
			List<ProductTransactionOverallQuantities> invalidProductTransactionOverallQuantities = [];

			foreach (TransactionInput transactionInput in transactionInputs)
			{
				foreach (ProductTransactionInput productTransaction in transactionInput.ProductTransactionInputs)
				{
					var productTransactionOverallQuantities = allProductTransactionOverallQuantities.Where(p => p.ProductId == productTransaction.ProductId).FirstOrDefault();

					if (productTransactionOverallQuantities is null)
					{
						allProductTransactionOverallQuantities.Add(new ProductTransactionOverallQuantities
						{
							ProductId = productTransaction.ProductId,
							OverallQuantity = productTransaction.Quantity,
							ProductTransactionOverallQuantitiesTransactions = [new ProductTransactionOverallQuantitiesTransaction { TransactionId = transactionInput.Id, TransactionCode = transactionInput.InvoiceNo }]
						});
					}
					else
					{
						productTransactionOverallQuantities.OverallQuantity += productTransaction.Quantity;
						productTransactionOverallQuantities.ProductTransactionOverallQuantitiesTransactions.Add(new ProductTransactionOverallQuantitiesTransaction
						{
							TransactionId = transactionInput.Id,
							TransactionCode = transactionInput.InvoiceNo
						});
					}
				}
			}

			foreach (var productTransactionOverallQuantity in allProductTransactionOverallQuantities)
			{
				var product = productsFromRepo.Where(p => p.Id == productTransactionOverallQuantity.ProductId).FirstOrDefault();

				if (product is not null)
				{
					if (product.Id == productTransactionOverallQuantity.ProductId && product.StockQuantity < productTransactionOverallQuantity.OverallQuantity)
					{
						productTransactionOverallQuantity.ProductCode = product.Code;
						productTransactionOverallQuantity.ProductName = product.Name;
						productTransactionOverallQuantity.CurrentQuantity = product.StockQuantity;
						invalidProductTransactionOverallQuantities.Add(productTransactionOverallQuantity);
					}
				}
			}

			List<InvalidProductTransactionOverallQuantitiesTransaction> invalidProductTransactions = [];

			foreach (var invalid in invalidProductTransactionOverallQuantities)
			{
				foreach (var transaction in invalid.ProductTransactionOverallQuantitiesTransactions)
				{
					var invalidProductTransaction = invalidProductTransactions.Where(i => i.TransactionId == transaction.TransactionId).FirstOrDefault();

					if (invalidProductTransaction is null)
					{
						var invalidPT = new InvalidProductTransactionOverallQuantitiesTransaction
						{
							TransactionId = transaction.TransactionId,
							TransactionCode = transaction.TransactionCode
						};
						invalidPT.InvalidProductTransactionOverallQuantities.Add(new InvalidProductTransactionOverallQuantities
						{
							ProductId = invalid.ProductId,
							ProductCode = invalid.ProductCode,
							ProductName = invalid.ProductName,
							CurrentQuantity = invalid.CurrentQuantity,
							OverallQuantity = invalid.OverallQuantity,
						});

						invalidProductTransactions.Add(invalidPT);
					}
					else
					{
						invalidProductTransaction.InvalidProductTransactionOverallQuantities.Add(
						  new InvalidProductTransactionOverallQuantities
						  {
							  ProductId = invalid.ProductId,
							  ProductCode = invalid.ProductCode,
							  ProductName = invalid.ProductName,
							  CurrentQuantity = invalid.CurrentQuantity,
							  OverallQuantity = invalid.OverallQuantity
						  }
						);
					}
				}
			}

			return invalidProductTransactions;
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

			foreach (var textOrder in textOrdersArray)
			{
				var textOrderLines = textOrder.ToLower().Split("*");

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
						var productFromRepo = await productRepository.GetProductByCode(productCode);
						var productPerPanelFromRepo = await productStockPerPanelRepository.GetProductStockPerPanel(productFromRepo.Id, userAccountId);
						var price = textOrderLines.Length > 2 ? Convert.ToDouble(textOrderLines[2].Trim()) : (productPerPanelFromRepo != null ? productPerPanelFromRepo.PricePerUnit : 0.0);

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
