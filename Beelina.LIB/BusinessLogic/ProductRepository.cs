﻿using System.Security.Cryptography;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
  public class ProductRepository
      : BaseRepository<Product>, IProductRepository<Product>
  {
    private readonly IProductStockPerPanelRepository<ProductStockPerPanel> _productStockPerPanelRepository;
    private IProductStockPerWarehouseRepository<ProductStockPerWarehouse> _productStockPerWarehouseRepository;
    private readonly IProductStockAuditRepository<ProductStockAudit> _productStockAuditRepository;
    private readonly IProductUnitRepository<ProductUnit> _productUnitRepository;
    private readonly IUserAccountRepository<UserAccount> _userAccountRepository;
    private readonly IGeneralSettingRepository<GeneralSetting> _generalSettingRepository;
    private readonly ICurrentUserService _currentUserService;

    public ProductRepository(IBeelinaRepository<Product> beelinaRepository,
        IProductStockPerPanelRepository<ProductStockPerPanel> productStockPerPanelRepository,
        IProductStockPerWarehouseRepository<ProductStockPerWarehouse> productStockPerWarehouseRepository,
        IProductStockAuditRepository<ProductStockAudit> productStockAuditRepository,
        IProductUnitRepository<ProductUnit> productUnitRepository,
        IUserAccountRepository<UserAccount> userAccountRepository,
        ICurrentUserService currentUserService)
        : base(beelinaRepository, beelinaRepository.ClientDbContext)
    {
      _productStockPerPanelRepository = productStockPerPanelRepository;
      _productStockPerWarehouseRepository = productStockPerWarehouseRepository;
      _productStockAuditRepository = productStockAuditRepository;
      _productUnitRepository = productUnitRepository;
      _userAccountRepository = userAccountRepository;
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

    public async Task<IList<Product>> GetProducts(int userId, int productId, string filterKeyWord = "", CancellationToken cancellationToken = default)
    {
      var finalProductsFromRepo = new List<Product>();
      var generalSetting = await _beelinaRepository
                                  .ClientDbContext
                                  .GeneralSettings
                                  .FirstOrDefaultAsync(cancellationToken);

      try
      {

        var userRetailModulePermission = await _userAccountRepository.GetCurrentUsersPermissionLevel(_currentUserService.CurrentUserId, ModulesEnum.Distribution);

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

                                      where
                                        !p.IsDelete
                                        && p.IsActive
                                        && ((productId > 0 && p.Id == productId) || productId == 0)
                                        && (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.Manager ||
                                          ((userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User || userRetailModulePermission.PermissionLevel == PermissionLevelEnum.Administrator) && pp != null))

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
                                        ProductUnit = pu
                                      }).ToListAsync(cancellationToken);

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
                                        })
                                        .OrderByDescending(p => p.SearchResultPercentage)
                                        .ToList();

        if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelMonitoring)
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
                                          }).ToListAsync(cancellationToken);

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
                                                 }).ToListAsync(cancellationToken);

          // Join product information with their corresponding actual stock quantity
          finalProductsFromRepo = (from p in productsStocksAuditsPerProductPanel
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
                                   })
                                  .ToList();
        }
        else
        {
          var warehouseProducts = await GetWarehouseProducts(1, productId, filterKeyWord, cancellationToken, filteredProductsFromRepo);
          finalProductsFromRepo = (from p in filteredProductsFromRepo
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
                                   })
                                        .ToList();
        }
      }
      catch (TaskCanceledException ex)
      {
        throw new Exception($"Executing GetProducts has been cancelled. {ex.Message}");
      }

      return finalProductsFromRepo;
    }

    public async Task<IList<Product>> GetWarehouseProducts(int warehouseId, int productId, string filterKeyWord = "", CancellationToken cancellationToken = default, List<FilteredProduct> filteredProducts = null)
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

                                        where
                                          !p.IsDelete
                                          && p.IsActive
                                          && ((productId > 0 && p.Id == productId) || productId == 0)

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
                                          ProductUnit = pu
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
                                                        }).ToListAsync(cancellationToken);

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
                                                        }).ToListAsync(cancellationToken);

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
          finalProductsFromRepo = (from p in filteredProductsFromRepo
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
                                   })
                                  .ToList();
        }
        else
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
                                                        }).ToListAsync(cancellationToken);

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
                                         }).ToListAsync(cancellationToken);

          var overallWarehouseProductStockAudits = warehouseProductStockAuditsFinal
                                                                .Union(orderTransactions)
                                                                .GroupBy(p => p.ProductId)
                                                                .Select(p => new
                                                                {
                                                                  ProductId = p.Key,
                                                                  Quantity = p.Sum(q => q.Quantity)
                                                                }).ToList();

          // Join products with their corresponding absolute stock quantity.
          finalProductsFromRepo = (from p in filteredProductsFromRepo
                                   join owsa in overallWarehouseProductStockAudits
                                   on new { Id = p.Id } equals new { Id = owsa.ProductId }

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
                                     StockQuantity = owsa.Quantity,
                                   })
                                  .ToList();
        }

      }
      catch (TaskCanceledException ex)
      {
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
      var productFromRepo = await _beelinaRepository.ClientDbContext.Products.Where((p) => p.Id != productId && p.Code == productCode).FirstOrDefaultAsync();
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
      var productsFromRepo = new List<Product>();
      var counter = 0;
      using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
      try
      {
        SetCurrentUserId(_currentUserService.CurrentUserId);

        foreach (var productInput in productInputs)
        {
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
            };
          }
          else
          {
            productFromRepo.Id = productInput.Id;
            productFromRepo.Name = productInput.Name;
            productFromRepo.Code = productInput.Code;
            productFromRepo.Description = productInput.Description;
            productFromRepo.IsTransferable = productInput.IsTransferable;
            productFromRepo.NumberOfUnits = productInput.NumberOfUnits;
          }

          // Create new product unit if not exists.
          //===========================================================================================================
          var productUnitFromRepo = await ManageProductUnit(productInput.ProductUnitInput.Name, cancellationToken);
          productFromRepo.ProductUnitId = productUnitFromRepo.Id;

          await UpdateProduct(productFromRepo);

          // Create new product stock per panel if not exists.
          var productStockPerPanelFromRepo = await ManageProductStockPerPanel(productFromRepo, productInput, userAccountId, cancellationToken);

          // Insert new stock audit for the product
          //===========================================================================================================
          await ManageProductStockAudit(productStockPerPanelFromRepo, productInput, warehouseId);
          productsFromRepo.Add(productFromRepo);

          // Commit transaction if all operations succeed
          if (counter == (productInputs.Count - 1)) await transaction.CommitAsync(cancellationToken);
          counter++;
        }
      }
      catch
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync(cancellationToken);
        throw;
      }

      return productsFromRepo;
    }

    public async Task<List<Product>> CreateOrUpdateWarehouseProducts(int warehouseId, List<ProductInput> productInputs, CancellationToken cancellationToken = default)
    {
      // Begin a transaction
      var productsFromRepo = new List<Product>();
      var counter = 0;
      using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
      try
      {
        SetCurrentUserId(_currentUserService.CurrentUserId);

        foreach (var productInput in productInputs)
        {
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
            };
          }
          else
          {
            productFromRepo.Id = productInput.Id;
            productFromRepo.Name = productInput.Name;
            productFromRepo.Code = productInput.Code;
            productFromRepo.Description = productInput.Description;
            productFromRepo.IsTransferable = productInput.IsTransferable;
            productFromRepo.NumberOfUnits = productInput.NumberOfUnits;
          }

          // Create new product unit if not exists.
          //===========================================================================================================
          var productUnitFromRepo = await ManageProductUnit(productInput.ProductUnitInput.Name, cancellationToken);
          productFromRepo.ProductUnitId = productUnitFromRepo.Id;

          await UpdateProduct(productFromRepo);

          // Create new product stock per panel if not exists.
          var productStockPerWarehouseFromRepo = await ManageProductStockPerWarehouse(productFromRepo, productInput, warehouseId, cancellationToken);

          // Insert new stock audit for the product
          //===========================================================================================================
          await ManageWarehouseProductStockAudit(productStockPerWarehouseFromRepo, productInput);
          productsFromRepo.Add(productFromRepo);

          // Commit transaction if all operations succeed
          if (counter == (productInputs.Count - 1)) await transaction.CommitAsync(cancellationToken);
          counter++;
        }
      }
      catch
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync(cancellationToken);
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

        _beelinaRepository.ClientDbContext.ProductUnits.Add(productUnitFromRepo);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);
      }

      return productUnitFromRepo;
    }

    private async Task<ProductStockPerPanel> ManageProductStockPerPanel(Product product, ProductInput productInput, int userAccountId, CancellationToken cancellationToken)
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
        await _beelinaRepository.ClientDbContext.ProductStockPerPanels.AddAsync(productStockPerPanelFromRepo);
      await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

      return productStockPerPanelFromRepo;
    }

    private async Task<ProductStockPerWarehouse> ManageProductStockPerWarehouse(Product product, ProductInput productInput, int warehouseId, CancellationToken cancellationToken)
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
        await _beelinaRepository.ClientDbContext.ProductStockPerWarehouse.AddAsync(productStockPerWarehouseFromRepo);
      await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);

      return productStockPerWarehouseFromRepo;
    }

    private async Task ManageProductStockAudit(ProductStockPerPanel productStockPerPanel, ProductInput productInput, int warehouseId)
    {
      if (productInput.StockQuantity != 0)
      {
        var productStockAudit = new ProductStockAudit
        {
          ProductStockPerPanelId = productStockPerPanel.Id,
          Quantity = productInput.StockQuantity,
          StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
          WithdrawalSlipNo = productInput.WithdrawalSlipNo,
          WarehouseId = warehouseId
        };

        if (productStockAudit.Id == 0)
          await _beelinaRepository.ClientDbContext.ProductStockAudits.AddAsync(productStockAudit);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync();
      }
    }

    private async Task ManageWarehouseProductStockAudit(ProductStockPerWarehouse productStockPerWarehouse, ProductInput productInput)
    {
      if (productInput.StockQuantity != 0)
      {
        var productWarehouseStockAudit = new ProductStockWarehouseAudit
        {
          ProductStockPerWarehouseId = productStockPerWarehouse.Id,
          Quantity = productInput.StockQuantity,
          StockAuditSource = StockAuditSourceEnum.OrderFromSupplier,
          PurchaseOrderNumber = productInput.WithdrawalSlipNo
        };

        if (productWarehouseStockAudit.Id == 0)
          await _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit.AddAsync(productWarehouseStockAudit);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync();
      }
    }

    public async Task<List<ProductStockAudit>> GetProductStockAudits(int productId, int userAccountId)
    {
      var productStockAuditsFromRepo = await _beelinaRepository.ClientDbContext.ProductStockPerPanels
                                      .Where(pp =>
                                          pp.ProductId == productId
                                          && pp.UserAccountId == userAccountId
                                      )
                                      .Include(pp => pp.ProductStockAudits)
                                      .ThenInclude(pa => pa.CreatedBy)
                                      .FirstOrDefaultAsync();

      return productStockAuditsFromRepo
            .ProductStockAudits
            .Where(pa => pa.IsActive)
            .OrderByDescending(ps => ps.DateCreated)
            .ToList();
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
                                                    TransactionNumber = (pa.PurchaseOrderNumber ?? ""),
                                                    ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                    ModifiedDate = pa.DateCreated
                                                  }).ToListAsync();

      if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelMonitoring)
      {
        var panelProductStockFromWithdrawals = await (from pp in _beelinaRepository.ClientDbContext.ProductStockPerPanels
                                                      join pa in _beelinaRepository.ClientDbContext.ProductStockAudits

                                                      on new { ProductStockPerPanelId = pp.Id } equals new { ProductStockPerPanelId = pa.ProductStockPerPanelId }
                                                      into productStockAuditPerPanelJoin
                                                      from pa in productStockAuditPerPanelJoin.DefaultIfEmpty()

                                                      join u in _beelinaRepository.ClientDbContext.UserAccounts
                                                      on pa.CreatedById equals u.Id

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
                                                        TransactionNumber = (pa.WithdrawalSlipNo ?? ""),
                                                        ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                        ModifiedDate = pa.DateCreated
                                                      }).ToListAsync();


        productStockAuditItemsFromRepo.AddRange(panelProductStockFromWithdrawals);
      }
      else
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
                                                     ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                     ModifiedDate = t.DateCreated
                                                   }).ToListAsync();

        productStockAuditItemsFromRepo.AddRange(productTransactionsAuditItems);
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

    public async Task<List<ProductStockAuditItem>> GetProductStockAuditItems(int productId, int userAccountId, StockAuditSourceEnum stockAuditSource, string fromDate, string toDate)
    {
      var generalSetting = await _beelinaRepository
                                  .ClientDbContext
                                  .GeneralSettings
                                  .FirstOrDefaultAsync();

      if (generalSetting.BusinessModel == BusinessModelEnum.WarehousePanelMonitoring)
      {
        var productStockAuditItemsFromRepo = await (from ps in _beelinaRepository.ClientDbContext.ProductStockPerPanels
                                                    join pa in _beelinaRepository.ClientDbContext.ProductStockAudits

                                                    on new { Id = ps.Id } equals new { Id = pa.ProductStockPerPanelId }
                                                    into productStockAuditJoin
                                                    from pa in productStockAuditJoin.DefaultIfEmpty()

                                                    join u in _beelinaRepository.ClientDbContext.UserAccounts
                                                    on pa.CreatedById equals u.Id

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
                                                      TransactionNumber = pa.WithdrawalSlipNo,
                                                      ModifiedBy = String.Format("{0} {1}", u.FirstName, u.LastName),
                                                      ModifiedDate = pa.DateCreated
                                                    }).ToListAsync();

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
                                                   }).ToListAsync();


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

    public async Task<ProductStockAudit> GetProductStockAudit(int productStockAuditId)
    {
      var productStockAuditFromRepo = await _beelinaRepository.ClientDbContext.ProductStockAudits
                                      .Where(pp => pp.Id == productStockAuditId)
                                      .FirstOrDefaultAsync();
      return productStockAuditFromRepo;
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

      var sourceProductFromRepo = await GetProducts(userAccountId, sourceProductId, "", cancellationToken);
      var destinationProductFromRepo = await GetProducts(userAccountId, destinationProductId, "", cancellationToken);

      if (!sourceProductFromRepo[0].IsTransferable) return sourceProductFromRepo[0];

      using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
      try
      {
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
        await _beelinaRepository.ClientDbContext.SaveChangesAsync();

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
          await _beelinaRepository.ClientDbContext.ProductStockAudits.AddAsync(destinationProductStockAudit);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync();
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
          await _beelinaRepository.ClientDbContext.SaveChangesAsync();

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
          await _beelinaRepository.ClientDbContext.ProductStockAudits.AddAsync(destinationProductStockAudit);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync();
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
        await _beelinaRepository.ClientDbContext.ProductStockAudits.AddAsync(sourceProductStockAudit);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
      }
      catch
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync(cancellationToken);
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

      var sourceProductFromRepo = await GetWarehouseProducts(warehouseId, sourceProductId, "", cancellationToken);
      var destinationProductFromRepo = await GetWarehouseProducts(warehouseId, destinationProductId, "", cancellationToken);

      if (!sourceProductFromRepo[0].IsTransferable) return sourceProductFromRepo[0];

      using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
      try
      {
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
        await _beelinaRepository.ClientDbContext.SaveChangesAsync();

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
          await _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit.AddAsync(destinationProductStockAudit);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync();
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
          await _beelinaRepository.ClientDbContext.ProductStockWarehouseAudit.AddAsync(destinationProductStockAudit);
          await _beelinaRepository.ClientDbContext.SaveChangesAsync();
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
      }
      catch
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync(cancellationToken);
        throw;
      }

      return sourceProductFromRepo[0];
    }

    public MapExtractedProductResult MapProductImport(ExtractProductResult productImportResult, IList<Product> warehouseProductsFromRepo)
    {
      var mapProductResult = new MapExtractedProductResult();

      var mappedProductsImport = (from pi in productImportResult.SuccessExtractedProducts
                                  join wp in warehouseProductsFromRepo
                                  on pi.Code equals wp.Code

                                  into productsJoin
                                  from pj in productsJoin.DefaultIfEmpty()

                                  select new MapExtractedProduct
                                  {
                                    Id = pj == null ? 0 : pj.Id,
                                    Code = pi.Code,
                                    Name = pi.Name,
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
                                  }).ToList();

      mapProductResult.SuccessExtractedProducts = mappedProductsImport;
      mapProductResult.FailedExtractedProducts = productImportResult.FailedExtractedProducts;
      return mapProductResult;
    }
  }
}