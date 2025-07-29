using System.Security.Cryptography;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Beelina.LIB.BusinessLogic
{
  public class ProductRepository
      : BaseRepository<Product>, IProductRepository<Product>
  {
    private readonly ILogger<ProductRepository> _logger;
    private readonly IProductStockPerPanelRepository<ProductStockPerPanel> _productStockPerPanelRepository;
    private readonly IProductStockPerWarehouseRepository<ProductStockPerWarehouse> _productStockPerWarehouseRepository;
    private readonly IProductUnitRepository<ProductUnit> _productUnitRepository;
    private readonly IUserAccountRepository<UserAccount> _userAccountRepository;
    private readonly ISubscriptionRepository<ClientSubscription> _subscriptionRepository;
    private readonly ICurrentUserService _currentUserService;

    public ProductRepository(IBeelinaRepository<Product> beelinaRepository,
        ILogger<ProductRepository> logger,
        IProductStockPerPanelRepository<ProductStockPerPanel> productStockPerPanelRepository,
        IProductStockPerWarehouseRepository<ProductStockPerWarehouse> productStockPerWarehouseRepository,
        IProductUnitRepository<ProductUnit> productUnitRepository,
        IUserAccountRepository<UserAccount> userAccountRepository,
        ISubscriptionRepository<ClientSubscription> subscriptionRepository,
        ICurrentUserService currentUserService)
        : base(beelinaRepository, beelinaRepository.ClientDbContext)
    {
      _logger = logger;
      _productStockPerPanelRepository = productStockPerPanelRepository;
      _productStockPerWarehouseRepository = productStockPerWarehouseRepository;
      _productUnitRepository = productUnitRepository;
      _userAccountRepository = userAccountRepository;
      _subscriptionRepository = subscriptionRepository;
      _currentUserService = currentUserService;
    }

    public async Task<List<Product>> GetProductsDetailList(int userId, string filterKeyWord = "")
    {
      var userRetailModulePermission = await _beelinaRepository
                     .ClientDbContext
                     .UserPermission
                     .Where(u =>
                         u.ModuleId == ModulesEnum.Distribution
                         && u.UserAccountId == _currentUserService.CurrentUserId
                     )
                     .FirstOrDefaultAsync();

      // Only gets the products that the user has permission to see.
      var productsFromRepo = await (from p in _beelinaRepository.ClientDbContext.Products
                                    join pp in _beelinaRepository.ClientDbContext.ProductStockPerPanels

                                    on new { Id = p.Id, UserAccountId = userId } equals new { Id = pp.ProductId, UserAccountId = pp.UserAccountId }
                                    into productStockJoin
                                    from pp in productStockJoin.DefaultIfEmpty()

                                    join pu in _beelinaRepository.ClientDbContext.ProductUnits
                                        on p.ProductUnitId equals pu.Id
                                        into productUnitJoin
                                    from pu in productUnitJoin.DefaultIfEmpty()

                                    where
                                      !p.IsDelete
                                      && p.IsActive
                                      && (filterKeyWord != "" && (p.Name.Contains(filterKeyWord) || p.Code.Contains(filterKeyWord)) || filterKeyWord == "")
                                      && (userRetailModulePermission.PermissionLevel > PermissionLevelEnum.User || (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User && pp != null))

                                    select new Product
                                    {
                                      Id = p.Id,
                                      Name = p.Name,
                                      Code = p.Code,
                                      IsTransferable = p.IsTransferable,
                                      NumberOfUnits = p.NumberOfUnits,
                                      Description = p.Description,
                                      ProductUnitId = p.ProductUnitId,
                                      ProductUnit = pu
                                    }).ToListAsync();


      return productsFromRepo;
    }

    /// <summary>
    /// Retrieves a list of products for a user, including detailed stock and supplier information, filtered by product ID, keyword, and additional product filters.
    /// </summary>
    /// <param name="userId">The ID of the user requesting the products.</param>
    /// <param name="productId">The specific product ID to filter by, or 0 to include all products.</param>
    /// <param name="filterKeyWord">A keyword to filter products by name or code.</param>
    /// <param name="productsFilter">Additional filter criteria for products, such as supplier, stock status, or price status.</param>
    /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
    /// <returns>A list of products matching the specified filters, enriched with stock and supplier data according to the business model and user permissions.</returns>
    public async Task<IList<Product>> GetProducts(int userId, int productId, string filterKeyWord = "", ProductsFilter productsFilter = null, CancellationToken cancellationToken = default)
    {
      var finalProductsFromRepo = new List<Product>();
      var generalSetting = await _beelinaRepository
                                  .ClientDbContext
                                  .GeneralSettings
                                  .AsNoTracking()
                                  .FirstOrDefaultAsync(cancellationToken);

      try
      {
        var userRetailModulePermission = await _userAccountRepository.GetCurrentUsersPermissionLevel(_currentUserService.CurrentUserId, ModulesEnum.Distribution);
        var userAccountsFromRepo = await _userAccountRepository.GetUserAccounts(userId, "", cancellationToken);
        var userAccount = userAccountsFromRepo.FirstOrDefault();

        // Gather products information with product stock per panel and product unit.
        // Only gets the products that the user has permission to see.
        var productsFromRepo = await (from p in _beelinaRepository.ClientDbContext.Products

                                      join pp in _beelinaRepository.ClientDbContext.ProductStockPerPanels
                                        on new { Id = p.Id, UserAccountId = userId } equals new { Id = pp.ProductId, UserAccountId = pp.UserAccountId }
                                        into productStockJoin
                                      from pp in productStockJoin.DefaultIfEmpty()

                                      join pu in _beelinaRepository.ClientDbContext.ProductUnits
                                        on p.ProductUnitId equals pu.Id
                                        into productUnitJoin
                                      from pu in productUnitJoin.DefaultIfEmpty()

                                      join ps in _beelinaRepository.ClientDbContext.Suppliers
                                        on p.SupplierId equals ps.Id
                                        into productSupplierJoin
                                      from ps in productSupplierJoin.DefaultIfEmpty()

                                      where
                                        !p.IsDelete
                                        && p.IsActive
                                        && ((productId > 0 && p.Id == productId) || productId == 0)
                                        && (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.Manager ||
                                          ((userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User || userRetailModulePermission.PermissionLevel == PermissionLevelEnum.Administrator) && pp != null))
                                        && (productsFilter == null || (productsFilter != null && ((productsFilter.SupplierId == 0) || (productsFilter.SupplierId > 0 && p.SupplierId == productsFilter.SupplierId))))

                                      select new
                                      {
                                        Id = p.Id,
                                        ProductPerPanelId = (pp == null ? 0 : pp.Id),
                                        IsLinkedToSalesAgent = (pp != null),
                                        Name = p.Name,
                                        Code = p.Code,
                                        IsTransferable = p.IsTransferable,
                                        NumberOfUnits = p.NumberOfUnits,
                                        Description = p.Description,
                                        PricePerUnit = (pp == null ? 0 : pp.PricePerUnit),
                                        ProductUnitId = p.ProductUnitId,
                                        ProductUnit = pu,
                                        SupplierId = p.SupplierId,
                                        Supplier = ps
                                      })
                                      .AsNoTracking()
                                      .ToListAsync(cancellationToken);

        var filteredProductsFromRepo = (from p in productsFromRepo
                                        where (filterKeyWord != "" && (p.Name.IsMatchAnyKeywords(filterKeyWord) || p.Code.IsMatchAnyKeywords(filterKeyWord)) || filterKeyWord == "")

                                        select new FilteredProduct
                                        {
                                          Id = p.Id,
                                          ProductPerPanelId = p.ProductPerPanelId,
                                          IsLinkedToSalesAgent = p.IsLinkedToSalesAgent,
                                          Name = p.Name,
                                          Code = p.Code,
                                          SearchResultPercentage = p.Name.CalculatePrecision(filterKeyWord) + p.Code.CalculatePrecision(filterKeyWord),
                                          IsTransferable = p.IsTransferable,
                                          NumberOfUnits = p.NumberOfUnits,
                                          Description = p.Description,
                                          PricePerUnit = p.PricePerUnit,
                                          ProductUnitId = p.ProductUnitId,
                                          ProductUnit = p.ProductUnit,
                                          SupplierId = p.SupplierId,
                                          Supplier = p.Supplier
                                        })
                                        .OrderByDescending(p => p.SearchResultPercentage)
                                        .ToList();

        // Business Model 1: Warehouse Panel Monitoring
        if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelMonitoring)
        {
          finalProductsFromRepo = await GetProductStocksFromPanelForBusinessModel1(filteredProductsFromRepo, userId, cancellationToken);
        }

        // Business Model 2: Warehouse Monitoring
        if (generalSetting.BusinessModel == BusinessModelEnum.WarehouseMonitoring)
        {
          finalProductsFromRepo = await GetProductStocksFromPanelForBusinessModel2(filteredProductsFromRepo, productId, filterKeyWord, productsFilter, userId, cancellationToken);
        }

        // Business Model 3: Warehouse Panel Hybrid Monitoring
        if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelHybridMonitoring)
        {

          // Sales Agent Type = Field Agent
          if (userAccount.SalesAgentType == SalesAgentTypeEnum.FieldAgent)
          {
            finalProductsFromRepo = await GetProductStocksFromPanelForBusinessModel1(filteredProductsFromRepo, userId, cancellationToken);
          }

          // Sales Agent Type = Warehouse Agent
          if (userAccount.SalesAgentType == SalesAgentTypeEnum.WarehouseAgent)
          {
            finalProductsFromRepo = await GetProductStocksFromPanelForBusinessModel2(filteredProductsFromRepo, productId, filterKeyWord, productsFilter, userId, cancellationToken);
          }
        }

        if (productsFilter is not null && productsFilter.StockStatus != ProductStockStatusEnum.All)
        {
          if (productsFilter.StockStatus == ProductStockStatusEnum.WithStocks)
          {
            finalProductsFromRepo = [.. finalProductsFromRepo.Where(p => p.StockQuantity > 0)];
          }
          else if (productsFilter.StockStatus == ProductStockStatusEnum.WithoutStocks)
          {
            finalProductsFromRepo = [.. finalProductsFromRepo.Where(p => p.StockQuantity <= 0)];
          }
        }


        if (productsFilter is not null && productsFilter.PriceStatus != ProductPriceStatusEnum.All)
        {
          if (productsFilter.PriceStatus == ProductPriceStatusEnum.WithPrice)
          {
            finalProductsFromRepo = [.. finalProductsFromRepo.Where(p => p.PricePerUnit > 0)];
          }
          else if (productsFilter.PriceStatus == ProductPriceStatusEnum.WithoutPrice)
          {
            finalProductsFromRepo = [.. finalProductsFromRepo.Where(p => p.PricePerUnit <= 0)];
          }
        }
      }
      catch (TaskCanceledException ex)
      {
        _logger.LogError(ex, "Executing GetProducts has been cancelled.");
        throw new Exception($"Executing GetProducts has been cancelled. {ex.Message}");
      }

      return finalProductsFromRepo;
    }

    public async Task<IList<Product>> GetWarehouseProducts(int warehouseId, int productId, string filterKeyWord = "", ProductsFilter productsFilter = null, CancellationToken cancellationToken = default, List<FilteredProduct> filteredProducts = null)
    {
      var finalProductsFromRepo = new List<Product>();
      var filteredProductsFromRepo = new List<FilteredProduct>();

      var generalSetting = await _beelinaRepository
                                  .ClientDbContext
                                  .GeneralSettings
                                  .FirstOrDefaultAsync(cancellationToken);
      try
      {

        if (filteredProducts == null)
        {
          // Get products base list
          var productsFromRepo = await (from p in _beelinaRepository.ClientDbContext.Products
                                        join pw in _beelinaRepository.ClientDbContext.ProductStockPerWarehouse

                                        on new { Id = p.Id, WarehouseId = warehouseId } equals new { Id = pw.ProductId, WarehouseId = pw.WarehouseId }
                                        into productStockJoin
                                        from pp in productStockJoin.DefaultIfEmpty()

                                        join pu in _beelinaRepository.ClientDbContext.ProductUnits
                                            on p.ProductUnitId equals pu.Id
                                            into productUnitJoin
                                        from pu in productUnitJoin.DefaultIfEmpty()

                                        join ps in _beelinaRepository.ClientDbContext.Suppliers
                                            on p.SupplierId equals ps.Id
                                            into productSupplierJoin
                                        from ps in productSupplierJoin.DefaultIfEmpty()

                                        where
                                          !p.IsDelete
                                          && p.IsActive
                                          && ((productId > 0 && p.Id == productId) || productId == 0)
                                          && (productsFilter == null || (productsFilter != null && ((productsFilter.SupplierId == 0) || (productsFilter.SupplierId > 0 && p.SupplierId == productsFilter.SupplierId))))

                                        select new
                                        {
                                          Id = p.Id,
                                          WarehouseId = (pp == null ? 0 : pp.WarehouseId),
                                          ProductPerWarehouseId = (pp == null ? 0 : pp.Id),
                                          Name = p.Name,
                                          Code = p.Code,
                                          NumberOfUnits = p.NumberOfUnits,
                                          Description = p.Description,
                                          IsTransferable = p.IsTransferable,
                                          PricePerUnit = (pp == null ? 0 : pp.PricePerUnit),
                                          ProductUnitId = p.ProductUnitId,
                                          ProductUnit = pu,
                                          SupplierId = p.SupplierId,
                                          Supplier = ps
                                        }).ToListAsync(cancellationToken);
          // Filter product list
          filteredProductsFromRepo = (from p in productsFromRepo
                                      where (filterKeyWord != "" && (p.Name.IsMatchAnyKeywords(filterKeyWord) || p.Code.IsMatchAnyKeywords(filterKeyWord)) || filterKeyWord == "")

                                      select new FilteredProduct
                                      {
                                        Id = p.Id,
                                        WarehouseId = p.WarehouseId,
                                        Name = p.Name,
                                        Code = p.Code,
                                        ProductPerWarehouseId = p.ProductPerWarehouseId,
                                        SearchResultPercentage = p.Name.CalculatePrecision(filterKeyWord) + p.Code.CalculatePrecision(filterKeyWord),
                                        NumberOfUnits = p.NumberOfUnits,
                                        Description = p.Description,
                                        PricePerUnit = p.PricePerUnit,
                                        ProductUnitId = p.ProductUnitId,
                                        ProductUnit = p.ProductUnit,
                                        IsTransferable = p.IsTransferable,
                                        SupplierId = p.SupplierId,
                                        Supplier = p.Supplier
                                      })
                                      .OrderByDescending(p => p.SearchResultPercentage)
                                      .ToList();
        }
        else
        {
          filteredProductsFromRepo = filteredProducts;
        }

        if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelMonitoring)
        {
          finalProductsFromRepo = await GetProductStocksFromWarehouseForBusinessModel1(filteredProductsFromRepo, warehouseId, cancellationToken);
        }

        if (generalSetting.BusinessModel == BusinessModelEnum.WarehouseMonitoring)
        {
          finalProductsFromRepo = await GetProductStocksFromWarehouseForBusinessModel2(filteredProductsFromRepo, warehouseId, cancellationToken);
        }

        if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelHybridMonitoring)
        {
          finalProductsFromRepo = await GetProductStocksFromWarehouseForBusinessModel3(filteredProductsFromRepo, warehouseId, cancellationToken);
        }

        if (productsFilter is not null && productsFilter.StockStatus != ProductStockStatusEnum.All)
        {
          if (productsFilter.StockStatus == ProductStockStatusEnum.WithStocks)
          {
            finalProductsFromRepo = [.. finalProductsFromRepo.Where(p => p.StockQuantity > 0)];
          }
          else if (productsFilter.StockStatus == ProductStockStatusEnum.WithoutStocks)
          {
            finalProductsFromRepo = [.. finalProductsFromRepo.Where(p => p.StockQuantity <= 0)];
          }
        }

        if (productsFilter is not null && productsFilter.PriceStatus != ProductPriceStatusEnum.All)
        {
          if (productsFilter.PriceStatus == ProductPriceStatusEnum.WithPrice)
          {
            finalProductsFromRepo = [.. finalProductsFromRepo.Where(p => p.PricePerUnit > 0)];
          }
          else if (productsFilter.PriceStatus == ProductPriceStatusEnum.WithoutPrice)
          {
            finalProductsFromRepo = [.. finalProductsFromRepo.Where(p => p.PricePerUnit <= 0)];
          }
        }
      }
      catch (TaskCanceledException ex)
      {
        _logger.LogError(ex, "Executing GetWarehouseProducts has been cancelled.");

        throw new Exception($"Executing GetWarehouseProducts has been cancelled. {ex.Message}");
      }

      return finalProductsFromRepo;
    }

    public async Task<Product> UpdateProduct(Product product)
    {
      if (product.Id == 0)
        await AddEntity(product);
      else
        await SaveChanges();

      return product;
    }

    public async Task<Product> GetProductByUniqueCode(int productId, string productCode)
    {
      var productFromRepo = await _beelinaRepository
                                .ClientDbContext
                                .Products
                                .Where((p) =>
                                    p.Id != productId &&
                                    p.Code == productCode &&
                                    p.IsActive &&
                                    !p.IsDelete
                                ).FirstOrDefaultAsync();
      return productFromRepo;
    }

    public async Task<Product> GetProductByCode(string productCode)
    {
      var productFromRepo = await _beelinaRepository.ClientDbContext.Products
                                .Where((p) => p.Code == productCode)
                                .Include(p => p.ProductUnit)
                                .FirstOrDefaultAsync();
      return productFromRepo;
    }

    public async Task<List<Product>> CreateOrUpdatePanelProducts(int userAccountId, int warehouseId, List<ProductInput> productInputs, CancellationToken cancellationToken = default)
    {
      // Begin a transaction
      var managedProducts = new List<Product>();
      var counter = 0;
      using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
      try
      {
        SetCurrentUserId(_currentUserService.CurrentUserId);

        _logger.LogInformation("Start of Transaction - Save Product Panels");

        foreach (var productInput in productInputs)
        {

          _logger.LogInformation("==================================================================================================");

          var productFromRepo = await GetEntity(productInput.Id).ToObjectAsync();

          if (productFromRepo == null)
          {
            productFromRepo = new Product
            {
              Id = productInput.Id,
              Name = productInput.Name,
              Code = productInput.Code,
              Description = productInput.Description,
              IsTransferable = productInput.IsTransferable,
              NumberOfUnits = productInput.NumberOfUnits,
              SupplierId = productInput.SupplierId
            };

            _logger.LogInformation("Part 1 - ({@counter}): Registering new product. Product: {@product}", counter, productFromRepo);

          }
          else
          {
            productFromRepo.Id = productInput.Id;
            productFromRepo.Name = productInput.Name;
            productFromRepo.Code = productInput.Code;
            productFromRepo.Description = productInput.Description;
            productFromRepo.IsTransferable = productInput.IsTransferable;
            productFromRepo.NumberOfUnits = productInput.NumberOfUnits;
            productFromRepo.SupplierId = productInput.SupplierId;

            _logger.LogInformation("Part 1 - ({@counter}): Updating existing product. Product: {@product}", counter, productFromRepo);
          }

          // Create new product unit if not exists.
          //===========================================================================================================
          _logger.LogInformation("Part 2 -  Product Unit Information saving...");
          var productUnitFromRepo = await ManageProductUnit(productInput.ProductUnitInput.Name, cancellationToken);
          productFromRepo.ProductUnitId = productUnitFromRepo.Id;

          await UpdateProduct(productFromRepo);
          _logger.LogInformation("Part 3 -  Product Information saved!");

          // Create new product stock per panel if not exists.
          _logger.LogInformation("Part 4 -  Product Stock Per Panel Information saving...");
          var productStockPerPanelFromRepo = await ManageProductStockPerPanel(productFromRepo, productInput, userAccountId, cancellationToken);

          managedProducts.Add(productFromRepo);

          // Commit transaction if all operations succeeded
          if (counter == (productInputs.Count - 1))
          {
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("End of Transaction: Products updated successfully. Transaction committed!");
            _logger.LogInformation("==================================================================================================");
          }
          counter++;
        }
      }
      catch (Exception ex)
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync(cancellationToken);

        _logger.LogError(ex, "End of Transaction: Error during product updates. Transaction rollback!");
        _logger.LogInformation("==================================================================================================");

        throw;
      }

      return managedProducts;
    }

    public async Task<List<Product>> CreateOrUpdateWarehouseProducts(int warehouseId, List<ProductInput> productInputs, CancellationToken cancellationToken = default)
    {
      // Begin a transaction
      var productsFromRepo = new List<Product>();
      var counter = 0;
      using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
      try
      {
        _logger.LogInformation("Start of Transaction - Save Warehouse Products");

        SetCurrentUserId(_currentUserService.CurrentUserId);

        foreach (var productInput in productInputs)
        {

          _logger.LogInformation("==================================================================================================");

          var productFromRepo = await GetEntity(productInput.Id).ToObjectAsync();

          if (productFromRepo == null)
          {
            productFromRepo = new Product
            {
              Id = productInput.Id,
              Name = productInput.Name,
              Code = productInput.Code,
              Description = productInput.Description,
              IsTransferable = productInput.IsTransferable,
              NumberOfUnits = productInput.NumberOfUnits,
              SupplierId = productInput.SupplierId,
            };

            _logger.LogInformation("Part 1 - ({@counter}): Registering new warehouse product. Product: {@product}", counter, productFromRepo);

          }
          else
          {
            productFromRepo.Id = productInput.Id;
            productFromRepo.Name = productInput.Name;
            productFromRepo.Code = productInput.Code;
            productFromRepo.Description = productInput.Description;
            productFromRepo.IsTransferable = productInput.IsTransferable;
            productFromRepo.NumberOfUnits = productInput.NumberOfUnits;
            productFromRepo.SupplierId = productInput.SupplierId;

            _logger.LogInformation("Part 1 - ({@counter}): Updating existing warehouse product. Product: {@product}", counter, productFromRepo);

          }

          // Create new product unit if not exists.
          //===========================================================================================================
          _logger.LogInformation("Part 2 - Warehouse Product Unit Information saving...");

          var productUnitFromRepo = await ManageProductUnit(productInput.ProductUnitInput.Name, cancellationToken);
          productFromRepo.ProductUnitId = productUnitFromRepo.Id;

          await UpdateProduct(productFromRepo);
          _logger.LogInformation("Part 3 - Warehouse Product Information saved!");

          // Create new product stock per panel if not exists.
          _logger.LogInformation("Part 4 - Product Warehouse Stock Per Panel Information saving...");

          var productStockPerWarehouseFromRepo = await ManageProductStockPerWarehouse(productFromRepo, productInput, warehouseId, cancellationToken);

          // Insert new stock audit for the product
          //===========================================================================================================
          // _logger.LogInformation("Part 5 - Warehouse Product Stock Audit saving...");

          // await ManageWarehouseProductStockAudit(productStockPerWarehouseFromRepo, productInput, cancellationToken);

          productsFromRepo.Add(productFromRepo);

          // Commit transaction if all operations succeed
          if (counter == (productInputs.Count - 1))
          {

            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("End of Transaction: Warehouse Products updated successfully. Transaction committed!");
            _logger.LogInformation("==================================================================================================");
          }
          counter++;
        }
      }
      catch (Exception ex)
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync(cancellationToken);

        _logger.LogError(ex, "End of Transaction: Error during warehouse product updates. Transaction rollback!");
        _logger.LogInformation("==================================================================================================");
        throw;
      }

      return productsFromRepo;
    }

    private async Task<ProductUnit> ManageProductUnit(string unitName, CancellationToken cancellationToken)
    {
      var productUnitFromRepo = await _productUnitRepository.GetProductUnitByName(unitName);

      if (productUnitFromRepo == null)
      {
        productUnitFromRepo = new ProductUnit
        {
          Name = unitName
        };

        await _beelinaRepository.ClientDbContext.ProductUnits.AddAsync(productUnitFromRepo);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("** Saved new product unit: {@productUnitFromRepo}", productUnitFromRepo);
      }

      return productUnitFromRepo;
    }

    public async Task<ProductStockPerPanel> ManageProductStockPerPanel(Product product, ProductInput productInput, int userAccountId, CancellationToken cancellationToken)
    {
      var productStockPerPanelFromRepo = await _productStockPerPanelRepository.GetProductStockPerPanel(productInput.Id, userAccountId);

      if (productStockPerPanelFromRepo is null)
      {
        productStockPerPanelFromRepo = new ProductStockPerPanel
        {
          ProductId = product.Id,
          UserAccountId = userAccountId,
          PricePerUnit = productInput.PricePerUnit
        };
      }
      else
      {
        productStockPerPanelFromRepo.PricePerUnit = productInput.PricePerUnit;
      }

      if (productStockPerPanelFromRepo.Id == 0)
      {
        await _beelinaRepository.ClientDbContext.ProductStockPerPanels.AddAsync(productStockPerPanelFromRepo, cancellationToken);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("** Saved new product stock per panel: {@productStockPerPanelFromRepo}", productStockPerPanelFromRepo);

      }
      else
      {
        await _productStockPerPanelRepository.SaveChanges(cancellationToken);

        _logger.LogInformation("** Updated existing product stock per panel: {@productStockPerPanelFromRepo}", productStockPerPanelFromRepo);

      }

      return productStockPerPanelFromRepo;
    }

    public async Task<ProductStockPerWarehouse> ManageProductStockPerWarehouse(Product product, ProductInput productInput, int warehouseId, CancellationToken cancellationToken)
    {
      var productStockPerWarehouseFromRepo = await _productStockPerWarehouseRepository.GetProductStockPerWarehouse(productInput.Id, warehouseId);

      if (productStockPerWarehouseFromRepo is null)
      {
        productStockPerWarehouseFromRepo = new ProductStockPerWarehouse
        {
          ProductId = product.Id,
          WarehouseId = warehouseId,
          PricePerUnit = productInput.PricePerUnit
        };
      }
      else
      {
        productStockPerWarehouseFromRepo.PricePerUnit = productInput.PricePerUnit;
      }

      if (productStockPerWarehouseFromRepo.Id == 0)
      {
        await _beelinaRepository.ClientDbContext.ProductStockPerWarehouse.AddAsync(productStockPerWarehouseFromRepo);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("** Saved new warehouse product stock per panel: {@productStockPerWarehouseFromRepo}", productStockPerWarehouseFromRepo);
      }
      else
      {
        await _productStockPerWarehouseRepository.SaveChanges(cancellationToken);

        _logger.LogInformation("** Updated existing warehouse product stock per panel: {@productStockPerWarehouseFromRepo}", productStockPerWarehouseFromRepo);
      }

      return productStockPerWarehouseFromRepo;
    }


    public async Task<List<ProductStockAuditItem>> GetWarehouseProductStockAuditItems(int productId, int warehouseId, StockAuditSourceEnum stockAuditSource, string fromDate, string toDate)
    {
      var generalSetting = await _beelinaRepository
                                  .ClientDbContext
                                  .GeneralSettings
                                  .FirstOrDefaultAsync();


      var productStockAuditItemsFromRepo = await (from ps in _beelinaRepository.ClientDbContext.ProductStockPerWarehouse
                                                  join pa in _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit

                                                  on new { Id = ps.Id } equals new { Id = pa.ProductStockPerWarehouseId }
                                                  into productStockAuditJoin
                                                  from pa in productStockAuditJoin.DefaultIfEmpty()

                                                  join u in _beelinaRepository.ClientDbContext.UserAccounts
                                                  on pa.CreatedById equals u.Id

                                                  join pr in _beelinaRepository.ClientDbContext.ProductWarehouseStockReceiptEntries
                                                  on pa.ProductWarehouseStockReceiptEntryId equals pr.Id

                                                  where
                                                    ps.ProductId == productId
                                                    && ps.WarehouseId == warehouseId
                                                    && pa.IsActive
                                                    && !pa.IsDelete
                                                    && ps.IsActive
                                                    && !ps.IsDelete

                                                  select new ProductStockAuditItem
                                                  {
                                                    Id = pa.Id,
                                                    Quantity = pa.Quantity,
                                                    StockAuditSource = pa.StockAuditSource,
                                                    TransactionNumber = pa.StockAuditSource == StockAuditSourceEnum.OrderFromSupplier ? (pr.ReferenceNo ?? "") : (pa.PurchaseOrderNumber ?? ""),
                                                    PlateNo = (pr.PlateNo ?? ""),
                                                    ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                    ModifiedDate = pa.DateCreated
                                                  }).ToListAsync();

      if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelMonitoring)
      {
        await GetWarehouseProductStockAuditItemsModel1(productStockAuditItemsFromRepo, productId, warehouseId);
      }

      if (generalSetting.BusinessModel == BusinessModelEnum.WarehouseMonitoring)
      {
        await GetWarehouseProductStockAuditItemsModel2(productStockAuditItemsFromRepo, productId);
      }

      if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelHybridMonitoring)
      {
        await GetWarehouseProductStockAuditItemsModel3(productStockAuditItemsFromRepo, productId, warehouseId);
      }

      if (stockAuditSource != StockAuditSourceEnum.None)
      {
        productStockAuditItemsFromRepo = productStockAuditItemsFromRepo.Where(t => t.StockAuditSource == stockAuditSource).ToList();
      }

      if (!string.IsNullOrEmpty(fromDate) || !string.IsNullOrEmpty(toDate))
      {
        fromDate = Convert.ToDateTime(fromDate).Add(new TimeSpan(0, 0, 0)).ToString("yyyy-MM-dd HH:mm:ss");
        toDate = Convert.ToDateTime(toDate).Add(new TimeSpan(23, 59, 0)).ToString("yyyy-MM-dd HH:mm:ss");

        if (!String.IsNullOrEmpty(fromDate))
        {
          productStockAuditItemsFromRepo = productStockAuditItemsFromRepo.Where(t => t.ModifiedDate >= Convert.ToDateTime(fromDate)).ToList();
        }

        if (!String.IsNullOrEmpty(toDate))
        {
          productStockAuditItemsFromRepo = productStockAuditItemsFromRepo.Where(t => t.ModifiedDate <= Convert.ToDateTime(toDate)).ToList();
        }
      }

      return productStockAuditItemsFromRepo;
    }

    public async Task<List<ProductStockAuditItem>> GetProductStockAuditItems(int productId, int userAccountId, StockAuditSourceEnum stockAuditSource, string fromDate, string toDate, CancellationToken cancellationToken = default)
    {
      var generalSetting = await _beelinaRepository
                                  .ClientDbContext
                                  .GeneralSettings
                                  .FirstOrDefaultAsync();

      var userAccountsFromRepo = await _userAccountRepository.GetUserAccounts(userAccountId, "", cancellationToken);
      var userAccount = userAccountsFromRepo.FirstOrDefault();

      if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelMonitoring ||
        (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelHybridMonitoring && userAccount.SalesAgentType == SalesAgentTypeEnum.FieldAgent))
      {
        var productStockAuditItemsFromRepo = await (from ps in _beelinaRepository.ClientDbContext.ProductStockPerPanels
                                                    join pa in _beelinaRepository.ClientDbContext.ProductStockAudits

                                                    on new { Id = ps.Id } equals new { Id = pa.ProductStockPerPanelId }
                                                    into productStockAuditJoin
                                                    from pa in productStockAuditJoin.DefaultIfEmpty()

                                                    join u in _beelinaRepository.ClientDbContext.UserAccounts
                                                    on pa.CreatedById equals u.Id

                                                    join pr in _beelinaRepository.ClientDbContext.ProductWithdrawalEntries
                                                    on pa.ProductWithdrawalEntryId equals pr.Id

                                                    where
                                                      ps.ProductId == productId
                                                      && ps.UserAccountId == userAccountId
                                                      && pa.IsActive
                                                      && !pa.IsDelete

                                                    select new ProductStockAuditItem
                                                    {
                                                      Id = pa.Id,
                                                      Quantity = pa.Quantity,
                                                      StockAuditSource = pa.StockAuditSource,
                                                      TransactionNumber = pa.StockAuditSource == StockAuditSourceEnum.FromWithdrawal ? (pr.WithdrawalSlipNo ?? "") : (pa.WithdrawalSlipNo ?? ""),
                                                      ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                      ModifiedDate = pa.DateCreated
                                                    })
                                                    .AsNoTracking()
                                                    .ToListAsync(cancellationToken);

        var productTransactionsAuditItems = await (from t in _beelinaRepository.ClientDbContext.Transactions
                                                   join pt in _beelinaRepository.ClientDbContext.ProductTransactions

                                                   on new { Id = t.Id } equals new { Id = pt.TransactionId }
                                                   into transactionJoin
                                                   from tj in transactionJoin.DefaultIfEmpty()

                                                   join u in _beelinaRepository.ClientDbContext.UserAccounts
                                                   on t.CreatedById equals u.Id

                                                   where
                                                     t.CreatedById == userAccountId
                                                     && t.Status == Enums.TransactionStatusEnum.Confirmed
                                                     && tj.ProductId == productId
                                                     && t.IsActive
                                                     && !t.IsDelete

                                                   select new ProductStockAuditItem
                                                   {
                                                     Id = t.Id,
                                                     Quantity = -tj.Quantity,
                                                     StockAuditSource = StockAuditSourceEnum.OrderTransaction,
                                                     TransactionNumber = t.InvoiceNo,
                                                     ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                     ModifiedDate = t.DateCreated
                                                   })
                                                   .AsNoTracking()
                                                   .ToListAsync(cancellationToken);


        productStockAuditItemsFromRepo.AddRange(productTransactionsAuditItems);

        if (stockAuditSource != StockAuditSourceEnum.None)
        {
          productStockAuditItemsFromRepo = productStockAuditItemsFromRepo.Where(t => t.StockAuditSource == stockAuditSource).ToList();
        }

        if (!string.IsNullOrEmpty(fromDate) || !string.IsNullOrEmpty(toDate))
        {
          fromDate = Convert.ToDateTime(fromDate).Add(new TimeSpan(0, 0, 0)).ToString("yyyy-MM-dd HH:mm:ss");
          toDate = Convert.ToDateTime(toDate).Add(new TimeSpan(23, 59, 0)).ToString("yyyy-MM-dd HH:mm:ss");

          if (!String.IsNullOrEmpty(fromDate))
          {
            productStockAuditItemsFromRepo = productStockAuditItemsFromRepo.Where(t => t.ModifiedDate >= Convert.ToDateTime(fromDate)).ToList();
          }

          if (!String.IsNullOrEmpty(toDate))
          {
            productStockAuditItemsFromRepo = productStockAuditItemsFromRepo.Where(t => t.ModifiedDate <= Convert.ToDateTime(toDate)).ToList();
          }
        }

        return productStockAuditItemsFromRepo;
      }
      else
      {
        return await GetWarehouseProductStockAuditItems(productId, 1, stockAuditSource, fromDate, toDate);
      }
    }

    public async Task<Product> TransferProductStockFromOwnInventory(
      int userAccountId,
      int warehouseId,
      int sourceProductId,
      int destinationProductId,
      int destinationProductNumberOfUnits,
      int sourceProductNumberOfUnits,
      int sourceNumberOfUnitsTransfered,
      TransferProductStockTypeEnum transferProductStockType,
      CancellationToken cancellationToken)
    {
      SetCurrentUserId(userAccountId);

      var sourceProductFromRepo = await GetProducts(userAccountId, sourceProductId, "", null, cancellationToken);
      var destinationProductFromRepo = await GetProducts(userAccountId, destinationProductId, "", null, cancellationToken);

      if (!sourceProductFromRepo[0].IsTransferable) return sourceProductFromRepo[0];

      using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
      try
      {

        _logger.LogInformation("Start of Transaction - Transfer product stocks");
        _logger.LogInformation("===========================================================================================");

        var sourceProductStockPerPanel = await _productStockPerPanelRepository.GetProductStockPerPanel(sourceProductId, userAccountId);
        var destinationProductStockPerPanel = await _productStockPerPanelRepository.GetProductStockPerPanel(destinationProductId, userAccountId);
        var destinationNumberOfUnitsReceived = 0;
        var productNumberOfUnits = 0;
        var productId = 0;

        // Identify which type of transfer stock.
        if (transferProductStockType == TransferProductStockTypeEnum.BulkToPiece)
        {
          destinationNumberOfUnitsReceived = sourceProductNumberOfUnits * sourceNumberOfUnitsTransfered;
          productNumberOfUnits = sourceProductNumberOfUnits;
          productId = sourceProductFromRepo[0].Id;
        }
        else
        {
          destinationNumberOfUnitsReceived = sourceNumberOfUnitsTransfered / destinationProductNumberOfUnits;
          productNumberOfUnits = destinationProductNumberOfUnits;
          productId = destinationProductFromRepo[0].Id;
        }

        // Part 1 - Make sure to update the source product
        var productFromRepo = await _beelinaRepository
                              .ClientDbContext
                              .Products
                              .Where(p => p.Id == productId)
                              .FirstOrDefaultAsync();
        productFromRepo.NumberOfUnits = productNumberOfUnits;
        await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Part 1 - Updated source product. Params: {@params}", productFromRepo);

        // Part 2 - Insert audit entry for the destination product
        if (destinationProductStockPerPanel != null && destinationProductStockPerPanel.Id > 0)
        {
          var destinationProductStockAudit = new ProductStockAudit
          {
            ProductStockPerPanelId = destinationProductStockPerPanel.Id,
            Quantity = destinationNumberOfUnitsReceived,
            StockAuditSource = StockAuditSourceEnum.MovedFromOtherProductInventory,
            SourceProductStockPerPanelId = sourceProductStockPerPanel.Id,
            SourceProductNumberOfUnits = sourceProductNumberOfUnits,
            TransferProductStockType = transferProductStockType,
            WithdrawalSlipNo = String.Empty,
            WarehouseId = warehouseId
          };
          await _beelinaRepository.ClientDbContext.ProductStockAudits.AddAsync(destinationProductStockAudit, cancellationToken);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

          _logger.LogInformation("Part 2 - Inserted audit entry for the destination product. Params: {@params}", destinationProductStockAudit);
        }
        else
        {
          destinationProductStockPerPanel = new ProductStockPerPanel
          {
            ProductId = destinationProductId,
            UserAccountId = userAccountId,
            PricePerUnit = destinationProductFromRepo[0].PricePerUnit
          };

          await _beelinaRepository.ClientDbContext.ProductStockPerPanels.AddAsync(destinationProductStockPerPanel);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

          var destinationProductStockAudit = new ProductStockAudit
          {
            ProductStockPerPanelId = destinationProductStockPerPanel.Id,
            Quantity = destinationNumberOfUnitsReceived,
            StockAuditSource = StockAuditSourceEnum.MovedFromOtherProductInventory,
            SourceProductStockPerPanelId = sourceProductStockPerPanel.Id,
            SourceProductNumberOfUnits = sourceProductNumberOfUnits,
            TransferProductStockType = transferProductStockType,
            WithdrawalSlipNo = String.Empty,
            WarehouseId = warehouseId
          };
          await _beelinaRepository.ClientDbContext.ProductStockAudits.AddAsync(destinationProductStockAudit, cancellationToken);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

          _logger.LogInformation("Part 2 - Inserted audit entry for the destination product. Params: {@params}", destinationProductStockAudit);
        }

        // Part 3 - Insert audit entry for the source product
        var sourceProductStockAudit = new ProductStockAudit
        {
          ProductStockPerPanelId = sourceProductStockPerPanel.Id,
          Quantity = -sourceNumberOfUnitsTransfered,
          StockAuditSource = StockAuditSourceEnum.MovedToOtherProductInventory,
          DestinationProductStockPerPanelId = destinationProductStockPerPanel.Id,
          TransferProductStockType = transferProductStockType,
          WithdrawalSlipNo = String.Empty,
          WarehouseId = warehouseId
        };
        await _beelinaRepository.ClientDbContext.ProductStockAudits.AddAsync(sourceProductStockAudit, cancellationToken);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        _logger.LogInformation("Part 3 - Inserted audit entry for the source product. Params: {@params}", sourceProductStockAudit);
        _logger.LogInformation("End of Transaction. Successfully transferred product stocks. Transaction committed!");
        _logger.LogInformation("===========================================================================================");

      }
      catch (Exception ex)
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync(cancellationToken);

        _logger.LogError(ex, "End of Transaction. Failed to transfer product stocks. Rollback transaction!");
        _logger.LogInformation("===========================================================================================");

        throw;
      }

      return sourceProductFromRepo[0];
    }

    public async Task<Product> TransferWarehouseProductStockFromOwnInventory(
      int userAccountId,
      int warehouseId,
      int sourceProductId,
      int destinationProductId,
      int destinationProductNumberOfUnits,
      int sourceProductNumberOfUnits,
      int sourceNumberOfUnitsTransfered,
      TransferProductStockTypeEnum transferProductStockType,
      CancellationToken cancellationToken)
    {
      SetCurrentUserId(userAccountId);

      var sourceProductFromRepo = await GetWarehouseProducts(warehouseId, sourceProductId, "", null, cancellationToken);
      var destinationProductFromRepo = await GetWarehouseProducts(warehouseId, destinationProductId, "", null, cancellationToken);

      if (!sourceProductFromRepo[0].IsTransferable) return sourceProductFromRepo[0];

      using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
      try
      {
        _logger.LogInformation("Start of Transaction - Transfer warehouse product stocks");
        _logger.LogInformation("===========================================================================================");

        var sourceProductStockPerPanel = await _productStockPerWarehouseRepository.GetProductStockPerWarehouse(sourceProductId, warehouseId);
        var destinationProductStockPerWarehouse = await _productStockPerWarehouseRepository.GetProductStockPerWarehouse(destinationProductId, warehouseId);
        var destinationNumberOfUnitsReceived = 0;
        var productNumberOfUnits = 0;
        var productId = 0;

        // Identify which type of transfer stock.
        if (transferProductStockType == TransferProductStockTypeEnum.BulkToPiece)
        {
          destinationNumberOfUnitsReceived = sourceProductNumberOfUnits * sourceNumberOfUnitsTransfered;
          productNumberOfUnits = sourceProductNumberOfUnits;
          productId = sourceProductFromRepo[0].Id;
        }
        else
        {
          destinationNumberOfUnitsReceived = sourceNumberOfUnitsTransfered / destinationProductNumberOfUnits;
          productNumberOfUnits = destinationProductNumberOfUnits;
          productId = destinationProductFromRepo[0].Id;
        }

        // Part 1 - Make sure to update the source product
        var productFromRepo = await _beelinaRepository
                              .ClientDbContext
                              .Products
                              .Where(p => p.Id == productId)
                              .FirstOrDefaultAsync();
        productFromRepo.NumberOfUnits = productNumberOfUnits;
        await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Part 1 - Updated source product. Params: {@params}", productFromRepo);

        // Part 2 - Insert audit entry for the destination product
        if (destinationProductStockPerWarehouse != null && destinationProductStockPerWarehouse.Id > 0)
        {
          var destinationProductStockAudit = new ProductStockWarehouseAudit
          {
            ProductStockPerWarehouseId = destinationProductStockPerWarehouse.Id,
            Quantity = destinationNumberOfUnitsReceived,
            StockAuditSource = StockAuditSourceEnum.MovedFromOtherProductInventory,
            SourceProductStockPerWarehouseId = sourceProductStockPerPanel.Id,
            SourceProductNumberOfUnits = sourceProductNumberOfUnits,
            TransferProductStockType = transferProductStockType,
            PurchaseOrderNumber = String.Empty,
          };
          await _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit.AddAsync(destinationProductStockAudit, cancellationToken);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

          _logger.LogInformation("Part 2 - Inserted audit entry for the destination product. Params: {@params}", destinationProductStockAudit);
        }
        else
        {
          destinationProductStockPerWarehouse = new ProductStockPerWarehouse
          {
            ProductId = destinationProductId,
            WarehouseId = warehouseId,
            PricePerUnit = destinationProductFromRepo[0].PricePerUnit
          };

          await _beelinaRepository.ClientDbContext.ProductStockPerWarehouse.AddAsync(destinationProductStockPerWarehouse);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync();

          var destinationProductStockAudit = new ProductStockWarehouseAudit
          {
            ProductStockPerWarehouseId = destinationProductStockPerWarehouse.Id,
            Quantity = destinationNumberOfUnitsReceived,
            StockAuditSource = StockAuditSourceEnum.MovedFromOtherProductInventory,
            SourceProductStockPerWarehouseId = sourceProductStockPerPanel.Id,
            SourceProductNumberOfUnits = sourceProductNumberOfUnits,
            TransferProductStockType = transferProductStockType,
            PurchaseOrderNumber = String.Empty,
          };
          await _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit.AddAsync(destinationProductStockAudit, cancellationToken);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

          _logger.LogInformation("Part 2 - Inserted audit entry for the destination product. Params: {@params}", destinationProductStockAudit);
        }

        // Part 3 - Insert audit entry for the source product
        var sourceProductStockAudit = new ProductStockWarehouseAudit
        {
          ProductStockPerWarehouseId = sourceProductStockPerPanel.Id,
          Quantity = -sourceNumberOfUnitsTransfered,
          StockAuditSource = StockAuditSourceEnum.MovedToOtherProductInventory,
          DestinationProductStockPerWarehouseId = destinationProductStockPerWarehouse.Id,
          TransferProductStockType = transferProductStockType,
          PurchaseOrderNumber = String.Empty,
        };
        await _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit.AddAsync(sourceProductStockAudit);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        _logger.LogInformation("Part 3 - Inserted audit entry for the source product. Params: {@params}", sourceProductStockAudit);
        _logger.LogInformation("End of Transaction. Successfully transferred product stocks. Transaction committed!");
        _logger.LogInformation("===========================================================================================");
      }
      catch (Exception ex)
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync(cancellationToken);

        _logger.LogError(ex, "End of Transaction. Failed to transfer product stocks. Rollback transaction!");
        _logger.LogInformation("===========================================================================================");

        throw;
      }

      return sourceProductFromRepo[0];
    }

    public async Task<MapExtractedProductResult> MapProductImport(ExtractProductResult productImportResult, IList<Product> warehouseProductsFromRepo)
    {
      var mapProductResult = new MapExtractedProductResult();

      var mappedProductsImport = (from pi in productImportResult.SuccessExtractedProducts
                                  join wp in warehouseProductsFromRepo
                                  on pi.Code equals wp.Code

                                  into productsJoin
                                  from pj in productsJoin.DefaultIfEmpty()

                                  join ps in _beelinaRepository.ClientDbContext.Suppliers
                                  on pi.SupplierCode equals ps.Code
                                  into productSupplierJoin
                                  from ps in productSupplierJoin.DefaultIfEmpty()

                                  select new MapExtractedProduct
                                  {
                                    Id = pj == null ? 0 : pj.Id,
                                    Code = pi.Code,
                                    Name = pi.Name,
                                    SupplierId = ps == null ? default : ps.Id,
                                    SupplierCode = pi.SupplierCode,
                                    Description = pj == null ? default : pj.Description,
                                    IsTransferable = pj == null ? default : pj.IsTransferable,
                                    Unit = pi.Unit,
                                    Price = pi.Price,
                                    NumberOfUnits = pi.NumberOfUnits,
                                    Quantity = pi.Quantity,
                                    OriginalNumberOfUnits = pj == null ? default : pj.NumberOfUnits,
                                    OriginalName = pj == null ? default : pj.Name,
                                    OriginalUnit = pj == null ? default : pj.ProductUnit.Name,
                                    OriginalPrice = pj == null ? default : pj.PricePerUnit,
                                    OriginalSupplierId = pj == null ? default : pj.Supplier.Id,
                                    OriginalSupplierCode = pj == null ? default : pj.Supplier.Code
                                  }).ToList();

      mapProductResult.SuccessExtractedProducts = mappedProductsImport;

      await ValidateSubscriptionProductRegistrations(productImportResult, mappedProductsImport.Count);

      mapProductResult.FailedExtractedProducts = productImportResult.FailedExtractedProducts;
      return mapProductResult;
    }

    private async Task ValidateSubscriptionProductRegistrations(ExtractProductResult productImportResult, int mappedProductsImportCount)
    {
      var productsCount = await _beelinaRepository.ClientDbContext.Products.Where(p => p.IsActive && p.IsDelete == false).CountAsync();
      var clientSubscriptionDetails = await _subscriptionRepository.GetClientSubscriptionDetails(_currentUserService.AppSecretToken, DateTime.Now.ToString("yyyy-MM-dd"));
      var absoluteTotalCounts = productsCount + mappedProductsImportCount;

      if (clientSubscriptionDetails.ProductSKUMax > 0 && absoluteTotalCounts >= clientSubscriptionDetails.ProductSKUMax)
      {
        productImportResult.FailedExtractedProducts.Add(new FailedExtractedProduct
        {
          RowNumber = 0,
          Message = "You are not allowed to register more than " + clientSubscriptionDetails.ProductSKUMax + " products based on your current subscription."
        });
      }
    }

    private async Task<List<Product>> GetProductStocksFromPanelForBusinessModel2(List<FilteredProduct> filteredProductsFromRepo, int productId, string filterKeyWord, ProductsFilter productsFilter, int userId, CancellationToken cancellationToken = default)
    {
      var warehouseProducts = await GetWarehouseProducts(1, productId, filterKeyWord, productsFilter, cancellationToken, filteredProductsFromRepo);
      var finalProductsFromRepo = (from p in filteredProductsFromRepo
                                   join wp in warehouseProducts
                                   on p.Id equals wp.Id

                                   select new Product
                                   {
                                     Id = p.Id,
                                     Name = p.Name,
                                     Code = p.Code,
                                     IsTransferable = p.IsTransferable,
                                     NumberOfUnits = p.NumberOfUnits,
                                     Description = p.Description,
                                     PricePerUnit = p.PricePerUnit,
                                     ProductUnitId = p.ProductUnitId,
                                     ProductUnit = p.ProductUnit,
                                     StockQuantity = wp.StockQuantity,
                                     IsLinkedToSalesAgent = p.IsLinkedToSalesAgent,
                                     SupplierId = p.SupplierId,
                                     Supplier = p.Supplier
                                   })
                                .ToList();

      return finalProductsFromRepo;
    }

    private async Task<List<Product>> GetProductStocksFromPanelForBusinessModel1(List<FilteredProduct> filteredProductsFromRepo, int userId, CancellationToken cancellationToken = default)
    {

      // Gather products absolute stock quantity based on the stock audit records.
      var productStockAudits = await (from ps in _beelinaRepository.ClientDbContext.ProductStockAudits
                                      where
                                          !ps.IsDelete
                                          && ps.IsActive

                                      group ps by new { ps.ProductStockPerPanelId } into g

                                      select new
                                      {
                                        ProductStockPerPanelId = g.Key.ProductStockPerPanelId,
                                        Quantity = g.Sum(ps => ps.Quantity)
                                      })
                                      .AsNoTracking()
                                      .ToListAsync(cancellationToken);

      // Join products with their corresponding absolute stock quantity.
      var productsStocksAuditsPerProductPanel = (from p in filteredProductsFromRepo
                                                 join ps in productStockAudits

                                                 on new { Id = p.ProductPerPanelId } equals new { Id = ps.ProductStockPerPanelId }
                                                 into productStockAuditJoin
                                                 from ps in productStockAuditJoin.DefaultIfEmpty()

                                                 select new
                                                 {
                                                   Id = p.Id,
                                                   ProductPerPanelId = p.ProductPerPanelId,
                                                   IsLinkedToSalesAgent = p.IsLinkedToSalesAgent,
                                                   Name = p.Name,
                                                   Code = p.Code,
                                                   IsTransferable = p.IsTransferable,
                                                   NumberOfUnits = p.NumberOfUnits,
                                                   Description = p.Description,
                                                   PricePerUnit = p.PricePerUnit,
                                                   ProductUnitId = p.ProductUnitId,
                                                   ProductUnit = p.ProductUnit,
                                                   SupplierId = p.SupplierId,
                                                   Supplier = p.Supplier,
                                                   StockAbsoluteQuantity = (ps == null ? 0 : ps.Quantity)
                                                 })
                                                 .ToList();

      // Gather product transactions per user account.
      var transactionsPerSalesAgent = await (from t in _beelinaRepository.ClientDbContext.Transactions
                                             join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                             on t.Id equals pt.TransactionId

                                             where
                                                  t.CreatedById == userId
                                                  && t.Status == Enums.TransactionStatusEnum.Confirmed // Make sure only included confirmed transactions
                                                 && !t.IsDelete
                                                 && t.IsActive
                                                 && !pt.IsDelete
                                                 && pt.IsActive

                                             group pt by new { pt.ProductId } into g

                                             select new
                                             {
                                               ProductId = g.Key.ProductId,
                                               Quantity = g.Sum(pt => pt.Quantity)
                                             })
                                            .AsNoTracking()
                                            .ToListAsync(cancellationToken);

      // Join product information with their corresponding actual stock quantity
      var finalProductsFromRepo = (from p in productsStocksAuditsPerProductPanel
                                   join t in transactionsPerSalesAgent

                                   on new { Id = p.Id } equals new { Id = t.ProductId }
                                   into productTransactionJoin
                                   from pt in productTransactionJoin.DefaultIfEmpty()

                                   select new Product
                                   {
                                     Id = p.Id,
                                     Name = p.Name,
                                     Code = p.Code,
                                     IsTransferable = p.IsTransferable,
                                     NumberOfUnits = p.NumberOfUnits,
                                     Description = p.Description,
                                     PricePerUnit = p.PricePerUnit,
                                     ProductUnitId = p.ProductUnitId,
                                     ProductUnit = p.ProductUnit,
                                     StockQuantity = p.StockAbsoluteQuantity - (pt == null ? 0 : pt.Quantity),
                                     IsLinkedToSalesAgent = p.IsLinkedToSalesAgent,
                                     SupplierId = p.SupplierId,
                                     Supplier = p.Supplier
                                   })
                              .ToList();

      return finalProductsFromRepo;
    }

    private async Task<List<Product>> GetProductStocksFromWarehouseForBusinessModel1(List<FilteredProduct> filteredProductsFromRepo, int warehouseId, CancellationToken cancellationToken = default)
    {
      // Get product stock audit
      var warehouseProductStockAuditsFinal = await (from pw in _beelinaRepository.ClientDbContext.ProductStockPerWarehouse
                                                    join pwa in _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit

                                                    on new { Id = pw.Id } equals new { Id = pwa.ProductStockPerWarehouseId }
                                                    into warehouseProductStockJoin
                                                    from pws in warehouseProductStockJoin.DefaultIfEmpty()

                                                    where
                                                        pw.WarehouseId == warehouseId
                                                        && !pw.IsDelete
                                                        && pw.IsActive
                                                        && !pws.IsDelete
                                                        && pws.IsActive

                                                    group pws by new { pws.ProductStockPerWarehouse.ProductId } into g

                                                    select new
                                                    {
                                                      ProductId = g.Key.ProductId,
                                                      Quantity = g.Sum(ps => ps.Quantity)
                                                    })
                                                    .AsNoTracking()
                                                    .ToListAsync(cancellationToken);

      // Get panel product stock tied to the warehouse products
      var panelProductStockFromWithdrawals = await (from pp in _beelinaRepository.ClientDbContext.ProductStockPerPanels
                                                    join pa in _beelinaRepository.ClientDbContext.ProductStockAudits

                                                    on new { ProductStockPerPanelId = pp.Id } equals new { ProductStockPerPanelId = pa.ProductStockPerPanelId }
                                                    into productStockAuditPerPanelJoin
                                                    from ppa in productStockAuditPerPanelJoin.DefaultIfEmpty()

                                                    where
                                                          ppa.WarehouseId == warehouseId
                                                          && ppa.StockAuditSource == StockAuditSourceEnum.FromWithdrawal
                                                          && !pp.IsDelete
                                                          && pp.IsActive
                                                          && !ppa.IsDelete
                                                          && ppa.IsActive

                                                    select new
                                                    {
                                                      ProductId = pp.ProductId,
                                                      Quantity = (ppa == null ? 0 : -ppa.Quantity),
                                                    })
                                                    .AsNoTracking()
                                                    .ToListAsync(cancellationToken);

      var panelProductStockFromWithdrawalsGrouped = (from pp in panelProductStockFromWithdrawals
                                                     group pp by pp.ProductId into g
                                                     select new
                                                     {
                                                       ProductId = g.Key,
                                                       Quantity = g.Sum(q => q.Quantity),
                                                     }).ToList();

      var panelProductWithdrawalStockAuditsFinal = (from fp in filteredProductsFromRepo
                                                    join pp in panelProductStockFromWithdrawalsGrouped

                                                    on new { ProductId = fp.Id } equals new { ProductId = pp.ProductId }
                                                    into productStockWithdrawalsPerPanelJoin
                                                    from pwp in productStockWithdrawalsPerPanelJoin.DefaultIfEmpty()

                                                    select new
                                                    {
                                                      ProductId = fp.Id,
                                                      Quantity = (pwp != null ? pwp.Quantity : 0),
                                                    }).ToList();

      var overallWarehouseProductStockAudits = warehouseProductStockAuditsFinal
                                                  .Union(panelProductWithdrawalStockAuditsFinal)
                                                  .GroupBy(p => p.ProductId)
                                                  .Select(p => new
                                                  {
                                                    ProductId = p.Key,
                                                    Quantity = p.Sum(q => q.Quantity)
                                                  }).ToList();

      // Join products with their corresponding absolute stock quantity.
      var finalProductsFromRepo = (from p in filteredProductsFromRepo
                                   join owsa in overallWarehouseProductStockAudits
                                   on new { Id = p.Id } equals new { Id = owsa.ProductId }

                                   select new Product
                                   {
                                     Id = p.Id,
                                     Name = p.Name,
                                     Code = p.Code,
                                     NumberOfUnits = p.NumberOfUnits,
                                     Description = p.Description,
                                     PricePerUnit = p.PricePerUnit,
                                     ProductUnitId = p.ProductUnitId,
                                     ProductUnit = p.ProductUnit,
                                     StockQuantity = owsa.Quantity,
                                     IsTransferable = p.IsTransferable,
                                     SupplierId = p.SupplierId,
                                     Supplier = p.Supplier
                                   }).ToList();

      return finalProductsFromRepo;
    }

    private async Task<List<Product>> GetProductStocksFromWarehouseForBusinessModel2(List<FilteredProduct> filteredProductsFromRepo, int warehouseId, CancellationToken cancellationToken = default)
    {
      // Get product stock audit
      var warehouseProductStockAuditsFinal = await (from pw in _beelinaRepository.ClientDbContext.ProductStockPerWarehouse
                                                    join pwa in _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit

                                                    on new { Id = pw.Id } equals new { Id = pwa.ProductStockPerWarehouseId }
                                                    into warehouseProductStockJoin
                                                    from pws in warehouseProductStockJoin.DefaultIfEmpty()

                                                    where
                                                        pw.WarehouseId == warehouseId
                                                        && !pw.IsDelete
                                                        && pw.IsActive
                                                        && !pws.IsDelete
                                                        && pws.IsActive

                                                    group pws by new { pws.ProductStockPerWarehouse.ProductId } into g

                                                    select new
                                                    {
                                                      ProductId = g.Key.ProductId,
                                                      Quantity = g.Sum(ps => ps.Quantity)
                                                    })
                                                    .AsNoTracking()
                                                    .ToListAsync(cancellationToken);

      // Gather product transactions per user account.
      var orderTransactions = await (from t in _beelinaRepository.ClientDbContext.Transactions
                                     join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                     on t.Id equals pt.TransactionId

                                     where
                                         t.Status == Enums.TransactionStatusEnum.Confirmed // Make sure only included confirmed transactions
                                         && !t.IsDelete
                                         && t.IsActive
                                         && !pt.IsDelete
                                         && pt.IsActive

                                     group pt by new { pt.ProductId } into g

                                     select new
                                     {
                                       ProductId = g.Key.ProductId,
                                       Quantity = -g.Sum(pt => pt.Quantity)
                                     })
                                     .AsNoTracking()
                                     .ToListAsync(cancellationToken);

      var overallWarehouseProductStockAudits = warehouseProductStockAuditsFinal
                                                            .Union(orderTransactions)
                                                            .GroupBy(p => p.ProductId)
                                                            .Select(p => new
                                                            {
                                                              ProductId = p.Key,
                                                              Quantity = p.Sum(q => q.Quantity)
                                                            }).ToList();

      // Join products with their corresponding absolute stock quantity.
      var finalProductsFromRepo = (from p in filteredProductsFromRepo
                                   join owsa in overallWarehouseProductStockAudits

                                   on new { Id = p.Id } equals new { Id = owsa.ProductId }
                                   into warehouseProductStockJoin
                                   from pws in warehouseProductStockJoin.DefaultIfEmpty()

                                   select new Product
                                   {
                                     Id = p.Id,
                                     Name = p.Name,
                                     Code = p.Code,
                                     IsTransferable = p.IsTransferable,
                                     NumberOfUnits = p.NumberOfUnits,
                                     Description = p.Description,
                                     PricePerUnit = p.PricePerUnit,
                                     ProductUnitId = p.ProductUnitId,
                                     ProductUnit = p.ProductUnit,
                                     SupplierId = p.SupplierId,
                                     StockQuantity = (pws == null ? 0 : pws.Quantity),
                                   })
                              .ToList();

      return finalProductsFromRepo;

    }

    private async Task<List<Product>> GetProductStocksFromWarehouseForBusinessModel3(List<FilteredProduct> filteredProductsFromRepo, int warehouseId, CancellationToken cancellationToken = default)
    {
      // Get product stock audit
      var warehouseProductStockAuditsFinal = await (from pw in _beelinaRepository.ClientDbContext.ProductStockPerWarehouse
                                                    join pwa in _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit

                                                    on new { Id = pw.Id } equals new { Id = pwa.ProductStockPerWarehouseId }
                                                    into warehouseProductStockJoin
                                                    from pws in warehouseProductStockJoin.DefaultIfEmpty()

                                                    where
                                                        pw.WarehouseId == warehouseId
                                                        && !pw.IsDelete
                                                        && pw.IsActive
                                                        && !pws.IsDelete
                                                        && pws.IsActive

                                                    group pws by new { pws.ProductStockPerWarehouse.ProductId } into g

                                                    select new
                                                    {
                                                      ProductId = g.Key.ProductId,
                                                      Quantity = g.Sum(ps => ps.Quantity)
                                                    })
                                                    .AsNoTracking()
                                                    .ToListAsync(cancellationToken);

      // Get panel product stock tied to the warehouse products
      var panelProductStockFromWithdrawals = await (from pp in _beelinaRepository.ClientDbContext.ProductStockPerPanels
                                                    join pa in _beelinaRepository.ClientDbContext.ProductStockAudits

                                                    on new { ProductStockPerPanelId = pp.Id } equals new { ProductStockPerPanelId = pa.ProductStockPerPanelId }
                                                    into productStockAuditPerPanelJoin
                                                    from ppa in productStockAuditPerPanelJoin.DefaultIfEmpty()

                                                    where
                                                          ppa.WarehouseId == warehouseId
                                                          && ppa.StockAuditSource == StockAuditSourceEnum.FromWithdrawal
                                                          && !pp.IsDelete
                                                          && pp.IsActive

                                                    select new
                                                    {
                                                      ProductId = pp.ProductId,
                                                      Quantity = (ppa == null ? 0 : -ppa.Quantity),
                                                    })
                                                    .AsNoTracking()
                                                    .ToListAsync(cancellationToken);

      // Gather product transactions from Sales agent type = Warehouse Agents.
      var orderTransactions = await (from t in _beelinaRepository.ClientDbContext.Transactions
                                     join pt in _beelinaRepository.ClientDbContext.ProductTransactions
                                     on t.Id equals pt.TransactionId

                                     join ua in _beelinaRepository.ClientDbContext.UserAccounts
                                     on t.CreatedById equals ua.Id

                                     where
                                         ua.SalesAgentType == SalesAgentTypeEnum.WarehouseAgent // Only transactions from Warehouse Agents
                                         && t.Status == Enums.TransactionStatusEnum.Confirmed // Make sure only included confirmed transactions
                                         && !t.IsDelete
                                         && t.IsActive
                                         && !pt.IsDelete
                                         && pt.IsActive

                                     group pt by new { pt.ProductId } into g

                                     select new
                                     {
                                       ProductId = g.Key.ProductId,
                                       Quantity = -g.Sum(pt => pt.Quantity)
                                     })
                                     .AsNoTracking()
                                     .ToListAsync(cancellationToken);

      var panelProductStockFromWithdrawalsGrouped = (from pp in panelProductStockFromWithdrawals
                                                     group pp by pp.ProductId into g
                                                     select new
                                                     {
                                                       ProductId = g.Key,
                                                       Quantity = g.Sum(q => q.Quantity),
                                                     }).ToList();

      var panelProductWithdrawalStockAuditsFinal = (from fp in filteredProductsFromRepo
                                                    join pp in panelProductStockFromWithdrawalsGrouped

                                                    on new { ProductId = fp.Id } equals new { ProductId = pp.ProductId }
                                                    into productStockWithdrawalsPerPanelJoin
                                                    from pwp in productStockWithdrawalsPerPanelJoin.DefaultIfEmpty()

                                                    select new
                                                    {
                                                      ProductId = fp.Id,
                                                      Quantity = (pwp != null ? pwp.Quantity : 0),
                                                    }).ToList();

      var overallWarehouseProductStockAudits = warehouseProductStockAuditsFinal
                                                  .Union(panelProductWithdrawalStockAuditsFinal)
                                                  .Union(orderTransactions)
                                                  .GroupBy(p => p.ProductId)
                                                  .Select(p => new
                                                  {
                                                    ProductId = p.Key,
                                                    Quantity = p.Sum(q => q.Quantity)
                                                  }).ToList();

      // Join products with their corresponding absolute stock quantity.
      var finalProductsFromRepo = (from p in filteredProductsFromRepo
                                   join owsa in overallWarehouseProductStockAudits
                                   on new { Id = p.Id } equals new { Id = owsa.ProductId }

                                   select new Product
                                   {
                                     Id = p.Id,
                                     Name = p.Name,
                                     Code = p.Code,
                                     NumberOfUnits = p.NumberOfUnits,
                                     Description = p.Description,
                                     PricePerUnit = p.PricePerUnit,
                                     ProductUnitId = p.ProductUnitId,
                                     ProductUnit = p.ProductUnit,
                                     StockQuantity = owsa.Quantity,
                                     IsTransferable = p.IsTransferable,
                                     SupplierId = p.SupplierId,
                                     Supplier = p.Supplier
                                   }).ToList();

      return finalProductsFromRepo;
    }


    private async Task GetWarehouseProductStockAuditItemsModel1(List<ProductStockAuditItem> productStockAuditItemsFromRepo, int productId, int warehouseId)
    {
      var panelProductStockFromWithdrawals = await (from pp in _beelinaRepository.ClientDbContext.ProductStockPerPanels
                                                    join pa in _beelinaRepository.ClientDbContext.ProductStockAudits

                                                    on new { ProductStockPerPanelId = pp.Id } equals new { ProductStockPerPanelId = pa.ProductStockPerPanelId }
                                                    into productStockAuditPerPanelJoin
                                                    from pa in productStockAuditPerPanelJoin.DefaultIfEmpty()

                                                    join u in _beelinaRepository.ClientDbContext.UserAccounts
                                                    on pa.CreatedById equals u.Id

                                                    join pr in _beelinaRepository.ClientDbContext.ProductWithdrawalEntries
                                                    on pa.ProductWithdrawalEntryId equals pr.Id

                                                    where
                                                          pp.ProductId == productId
                                                          && pa.WarehouseId == warehouseId
                                                          && pa.StockAuditSource == StockAuditSourceEnum.FromWithdrawal
                                                          && !pp.IsDelete
                                                          && pp.IsActive
                                                          && !pa.IsDelete
                                                          && pa.IsActive

                                                    select new ProductStockAuditItem
                                                    {
                                                      Id = pa.Id,
                                                      Quantity = (pa == null ? 0 : -pa.Quantity),
                                                      StockAuditSource = pa.StockAuditSource,
                                                      TransactionNumber = pa.StockAuditSource == StockAuditSourceEnum.FromWithdrawal ? (pr.WithdrawalSlipNo ?? "") : (pa.WithdrawalSlipNo ?? ""),
                                                      PlateNo = String.Empty,
                                                      ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                      ModifiedDate = pa.DateCreated
                                                    })
                                                    .AsNoTracking()
                                                    .ToListAsync();


      productStockAuditItemsFromRepo.AddRange(panelProductStockFromWithdrawals);
    }

    private async Task GetWarehouseProductStockAuditItemsModel2(List<ProductStockAuditItem> productStockAuditItemsFromRepo, int productId)
    {
      var productTransactionsAuditItems = await (from t in _beelinaRepository.ClientDbContext.Transactions
                                                 join pt in _beelinaRepository.ClientDbContext.ProductTransactions

                                                 on new { Id = t.Id } equals new { Id = pt.TransactionId }
                                                 into transactionJoin
                                                 from tj in transactionJoin.DefaultIfEmpty()

                                                 join u in _beelinaRepository.ClientDbContext.UserAccounts
                                                 on t.CreatedById equals u.Id

                                                 where
                                                   t.Status == Enums.TransactionStatusEnum.Confirmed
                                                   && tj.ProductId == productId
                                                   && t.IsActive
                                                   && !t.IsDelete

                                                 select new ProductStockAuditItem
                                                 {
                                                   Id = t.Id,
                                                   Quantity = -tj.Quantity,
                                                   StockAuditSource = StockAuditSourceEnum.OrderTransaction,
                                                   TransactionNumber = t.InvoiceNo,
                                                   PlateNo = String.Empty,
                                                   ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                   ModifiedDate = t.DateCreated
                                                 })
                                                 .AsNoTracking()
                                                 .ToListAsync();

      productStockAuditItemsFromRepo.AddRange(productTransactionsAuditItems);
    }

    /// <summary>
    /// Adds warehouse product stock audit items for a specific product and warehouse using business model 3 logic.
    /// </summary>
    /// <param name="productStockAuditItemsFromRepo">The list to which audit items will be added.</param>
    /// <param name="productId">The ID of the product.</param>
    /// <param name="warehouseId">The ID of the warehouse.</param>
    private async Task GetWarehouseProductStockAuditItemsModel3(List<ProductStockAuditItem> productStockAuditItemsFromRepo, int productId, int warehouseId)
    {
      var productTransactionsAuditItems = await (from t in _beelinaRepository.ClientDbContext.Transactions
                                                 join pt in _beelinaRepository.ClientDbContext.ProductTransactions

                                                 on new { Id = t.Id } equals new { Id = pt.TransactionId }
                                                 into transactionJoin
                                                 from tj in transactionJoin.DefaultIfEmpty()

                                                 join u in _beelinaRepository.ClientDbContext.UserAccounts
                                                 on t.CreatedById equals u.Id

                                                 where
                                                   t.Status == Enums.TransactionStatusEnum.Confirmed
                                                   && u.SalesAgentType == SalesAgentTypeEnum.WarehouseAgent // Only from warehouse agents
                                                   && tj.ProductId == productId
                                                   && t.IsActive
                                                   && !t.IsDelete

                                                 select new ProductStockAuditItem
                                                 {
                                                   Id = t.Id,
                                                   Quantity = -tj.Quantity,
                                                   StockAuditSource = StockAuditSourceEnum.OrderTransaction,
                                                   TransactionNumber = t.InvoiceNo,
                                                   PlateNo = String.Empty,
                                                   ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                   ModifiedDate = t.DateCreated
                                                 })
                                                 .AsNoTracking()
                                                 .ToListAsync();

      var panelProductStockFromWithdrawals = await (from pp in _beelinaRepository.ClientDbContext.ProductStockPerPanels
                                                    join pa in _beelinaRepository.ClientDbContext.ProductStockAudits

                                                    on new { ProductStockPerPanelId = pp.Id } equals new { ProductStockPerPanelId = pa.ProductStockPerPanelId }
                                                    into productStockAuditPerPanelJoin
                                                    from pa in productStockAuditPerPanelJoin.DefaultIfEmpty()

                                                    join u in _beelinaRepository.ClientDbContext.UserAccounts
                                                    on pa.CreatedById equals u.Id

                                                    join pr in _beelinaRepository.ClientDbContext.ProductWithdrawalEntries
                                                    on pa.ProductWithdrawalEntryId equals pr.Id

                                                    where
                                                          pp.ProductId == productId
                                                          && pa.WarehouseId == warehouseId
                                                          && pa.StockAuditSource == StockAuditSourceEnum.FromWithdrawal
                                                          && !pp.IsDelete
                                                          && pp.IsActive
                                                          && !pa.IsDelete
                                                          && pa.IsActive

                                                    select new ProductStockAuditItem
                                                    {
                                                      Id = pa.Id,
                                                      Quantity = (pa == null ? 0 : -pa.Quantity),
                                                      StockAuditSource = pa.StockAuditSource,
                                                      TransactionNumber = pa.StockAuditSource == StockAuditSourceEnum.FromWithdrawal ? (pr.WithdrawalSlipNo ?? "") : (pa.WithdrawalSlipNo ?? ""),
                                                      PlateNo = String.Empty,
                                                      ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                      ModifiedDate = pa.DateCreated
                                                    })
                                                    .AsNoTracking()
                                                    .ToListAsync();

      productStockAuditItemsFromRepo.AddRange(productTransactionsAuditItems);
      productStockAuditItemsFromRepo.AddRange(panelProductStockFromWithdrawals);
    }

    /// <summary>
    /// Retrieves product price assignments for a user account, filtered by keyword and product filters.
    /// </summary>
    /// <param name="userAccountId">The ID of the user account for which to retrieve product price assignments.</param>
    /// <param name="filterKeyWord">A keyword to filter products by name or code. Optional.</param>
    /// <param name="productsFilter">Additional product filter criteria. Optional.</param>
    /// <param name="cancellationToken">Token to cancel the asynchronous operation. Optional.</param>
    /// <returns>A collection of products with price assignments matching the specified filters, or an empty list if no filters are active.</returns>
    public async Task<IEnumerable<Product>> GetProductPriceAssignments(
        int userAccountId,
        string filterKeyWord = "",
        ProductsFilter productsFilter = null,
        CancellationToken cancellationToken = default)
    {

      // If no filter keyword is provided and the products filter is not active, return an empty list.
      if (String.IsNullOrEmpty(filterKeyWord) && !productsFilter.IsActive())
      {
        return [];
      }

      return await GetProducts(userAccountId, 0, filterKeyWord, productsFilter, cancellationToken);
    }

    /// <summary>
    /// Updates, adds, or deletes product price assignments for a user account based on the provided lists.
    /// </summary>
    /// <param name="userAccountId">The ID of the user account for which price assignments are managed.</param>
    /// <param name="updateProductAssignments">A list of product price assignments to update or add.</param>
    /// <param name="deletedProductAssignments">A list of product assignment IDs to delete or set price to zero.</param>
    /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
    /// <returns>A list of product stock per panel entities that were updated, added, or deleted.</returns>
    public async Task<List<ProductStockPerPanel>> UpdateProductPriceAssignments(
        int userAccountId,
        List<ProductStockPerPanelInput> updateProductAssignments,
        List<int> deletedProductAssignments,
        CancellationToken cancellationToken = default)
    {
      var managedProductStockPerPanels = new List<ProductStockPerPanel>();

      // Handle update/add logic
      foreach (var product in updateProductAssignments)
      {
        var productStockPerPanel = await UpdateOrAddProductStockPerPanel(product, userAccountId, cancellationToken);
        managedProductStockPerPanels.Add(productStockPerPanel);
      }

      // Handle delete logic
      if (deletedProductAssignments.Count > 0)
      {
        var deletedItems = await HandleDeletedProductAssignments(userAccountId, deletedProductAssignments, cancellationToken);
        managedProductStockPerPanels.AddRange(deletedItems);
      }

      await _productStockPerPanelRepository.SaveChanges(cancellationToken);

      return managedProductStockPerPanels;
    }

    /// <summary>
    /// Copies all active product price assignments from a source user account to a destination user account, creating new assignments or updating existing ones as needed.
    /// </summary>
    /// <param name="sourceUserAccountId">The user account ID from which to copy product price assignments.</param>
    /// <param name="destinationUserAccountId">The user account ID to which product price assignments will be copied.</param>
    /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
    /// <returns>A list of product stock per panel assignments that were created or updated for the destination user.</returns>
    public async Task<List<ProductStockPerPanel>> CopyProductPriceAssignments(
        int sourceUserAccountId,
        int destinationUserAccountId,
        CancellationToken cancellationToken = default)
    {
      var affectedAssignments = new List<ProductStockPerPanel>();

      // Get all product price assignments for the source user
      var sourceAssignments = await _productStockPerPanelRepository
          .GetProductStockPerPanelsByUserAccountId(sourceUserAccountId, cancellationToken);


      foreach (var sourceAssignment in sourceAssignments.Where(pa => pa.PricePerUnit > 0).ToList())
      {
        // Check if the destination user already has this product assignment
        var destAssignment = await _productStockPerPanelRepository
            .GetProductStockPerPanel(sourceAssignment.ProductId, destinationUserAccountId);

        if (destAssignment == null)
        {
          // Create new assignment for destination user
          destAssignment = new ProductStockPerPanel
          {
            ProductId = sourceAssignment.ProductId,
            UserAccountId = destinationUserAccountId,
            PricePerUnit = sourceAssignment.PricePerUnit,
            IsActive = true
          };
          await _productStockPerPanelRepository.AddEntity(destAssignment);
        }
        else
        {
          // Update price for existing assignment
          destAssignment.PricePerUnit = sourceAssignment.PricePerUnit;
        }

        affectedAssignments.Add(destAssignment);
      }

      await _productStockPerPanelRepository.SaveChanges(cancellationToken);

      return affectedAssignments;
    }

    /// <summary>
    /// Adds a new or updates an existing product stock per panel entry for a user account with the specified price per unit.
    /// </summary>
    /// <param name="product">The product stock per panel input containing product ID and price information.</param>
    /// <param name="userAccountId">The ID of the user account for which the assignment is managed.</param>
    /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
    /// <returns>The added or updated <see cref="ProductStockPerPanel"/> entity.</returns>
    private async Task<ProductStockPerPanel> UpdateOrAddProductStockPerPanel(ProductStockPerPanelInput product, int userAccountId, CancellationToken cancellationToken)
    {
      var productStockPerPanel = await _productStockPerPanelRepository.GetProductStockPerPanel(product.Id, userAccountId);
      if (productStockPerPanel == null)
      {
        productStockPerPanel = new ProductStockPerPanel
        {
          ProductId = product.Id,
          UserAccountId = userAccountId,
          PricePerUnit = product.PricePerUnit,
          IsActive = true
        };
        await _productStockPerPanelRepository.AddEntity(productStockPerPanel);
      }
      else
      {
        productStockPerPanel.PricePerUnit = product.PricePerUnit;
      }
      return productStockPerPanel;
    }

    /// <summary>
    /// Processes deleted product assignments for a user by setting the price per unit to zero for assignments with stock audits and force deleting those without stock audits.
    /// </summary>
    /// <param name="userAccountId">The ID of the user whose product assignments are being deleted.</param>
    /// <param name="deletedProductAssignments">A list of product assignment IDs to be deleted.</param>
    /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
    /// <returns>A list of product stock per panel entities that were processed for deletion.</returns>
    private async Task<List<ProductStockPerPanel>> HandleDeletedProductAssignments(
        int userAccountId,
        List<int> deletedProductAssignments,
        CancellationToken cancellationToken)
    {
      var deletedProductAssignmentsItems = await _productStockPerPanelRepository
          .GetDeletedProductAssignmentsItems(
              userAccountId,
              deletedProductAssignments,
              cancellationToken
          );

      // Handle deleted product assignments with stock audits. Set price per unit to 0.
      var deletedProductAssignmentsWithStockAudits = deletedProductAssignmentsItems
          .Where(p => p.ProductStockAudits.Count > 0)
          .ToList();
      deletedProductAssignmentsWithStockAudits.ForEach(p =>
      {
        p.PricePerUnit = 0;
      });

      // Handle deleted product assignments without stock audits. Force delete items.
      var deletedProductAssignmentsWithoutStockAudits = deletedProductAssignmentsItems
          .Where(p => p.ProductStockAudits.Count == 0)
          .ToList();
      if (deletedProductAssignmentsWithoutStockAudits.Count > 0)
      {
        _productStockPerPanelRepository.DeleteMultipleEntities(deletedProductAssignmentsWithoutStockAudits, true);
      }

      return deletedProductAssignmentsItems;
    }

    /// <summary>
    /// Retrieves the code of the most recently added active, non-deleted product.
    /// </summary>
    /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
    /// <returns>The latest product code, or an empty string if no product is found.</returns>
    public async Task<string> GetLatestProductCode(CancellationToken cancellationToken = default)
    {
      var latestProduct = await _beelinaRepository.ClientDbContext.Products
          .Where(p => p.IsActive && !p.IsDelete)
          .OrderByDescending(p => p.Id)
          .AsNoTracking()
          .FirstOrDefaultAsync(cancellationToken);
      return latestProduct != null ? latestProduct.Code : string.Empty;
    }

    /// <summary>
    /// Retrieves the invoice number of the most recent active, non-deleted transaction created by the specified user.
    /// </summary>
    /// <param name="userAccountId">The ID of the user whose transactions are queried.</param>
    /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
    /// <returns>The invoice number of the latest transaction, or an empty string if none exist.</returns>
    public async Task<string> GetLatestTransactionCode(int userAccountId, CancellationToken cancellationToken = default)
    {
      var transactions = _beelinaRepository.ClientDbContext.Transactions
          .Where(t => t.CreatedById == userAccountId);

      var latestTransaction = await transactions
          .Where(t => t.IsActive && !t.IsDelete)
          .OrderByDescending(x => x.Id)
          .AsNoTracking()
          .FirstOrDefaultAsync(cancellationToken);

      return latestTransaction?.InvoiceNo ?? string.Empty;
    }
  }
}