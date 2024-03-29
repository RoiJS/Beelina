﻿using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
  public class ProductRepository
      : BaseRepository<Product>, IProductRepository<Product>
  {
    private readonly IProductStockPerPanelRepository<ProductStockPerPanel> _productStockPerPanelRepository;
    private readonly IProductStockAuditRepository<ProductStockAudit> _productStockAuditRepository;
    private readonly IProductUnitRepository<ProductUnit> _productUnitRepository;
    private readonly ICurrentUserService _currentUserService;

    public ProductRepository(IBeelinaRepository<Product> beelinaRepository,
        IProductStockPerPanelRepository<ProductStockPerPanel> productStockPerPanelRepository,
        IProductStockAuditRepository<ProductStockAudit> productStockAuditRepository,
        IProductUnitRepository<ProductUnit> productUnitRepository,
        ICurrentUserService currentUserService)
        : base(beelinaRepository, beelinaRepository.ClientDbContext)
    {
      _productStockPerPanelRepository = productStockPerPanelRepository;
      _productStockAuditRepository = productStockAuditRepository;
      _productUnitRepository = productUnitRepository;
      _currentUserService = currentUserService;
    }

    public async Task<List<Product>> GetProductsDetailList(int userId, string filterKeyWord = "")
    {
      var userRetailModulePermission = await _beelinaRepository
                     .ClientDbContext
                     .UserPermission
                     .Where(u =>
                         u.ModuleId == ModulesEnum.Retail
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

    public async Task<IList<Product>> GetProducts(int userId, int productId, string filterKeyWord = "")
    {
      var userRetailModulePermission = await _beelinaRepository
                .ClientDbContext
                .UserPermission
                .Where(u =>
                    u.ModuleId == ModulesEnum.Retail
                    && u.UserAccountId == _currentUserService.CurrentUserId
                )
                .FirstOrDefaultAsync();

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
                                      // && (filterKeyWord != "" && (p.Name.Contains(filterKeyWord) || p.Code.Contains(filterKeyWord)) || filterKeyWord == "")
                                      && (userRetailModulePermission.PermissionLevel > PermissionLevelEnum.User || (userRetailModulePermission.PermissionLevel == PermissionLevelEnum.User && pp != null))

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
                                    }).ToListAsync();

      var filteredProductsFromRepo = (from p in productsFromRepo
                                      where (filterKeyWord != "" && (p.Name.IsMatchAnyKeywords(filterKeyWord) || p.Code.IsMatchAnyKeywords(filterKeyWord)) || filterKeyWord == "")

                                      select new
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
                                      }).ToListAsync();

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
                                             }).ToListAsync();

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
                                   })
                                  .ToList();

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

    public async Task<Product> CreateOrUpdateProduct(int userAccountId, ProductInput productInput, Product product)
    {
      // Begin a transaction
      using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
      try
      {
        SetCurrentUserId(_currentUserService.CurrentUserId);

        // Create new product unit if not exists.
        //===========================================================================================================
        var productUnitFromRepo = await ManageProductUnit(productInput.ProductUnitInput.Name);
        product.ProductUnitId = productUnitFromRepo.Id;

        await UpdateProduct(product);

        // Create new product stock per panel if not exists.
        var productStockPerPanelFromRepo = await ManageProductStockPerPanel(product, productInput, userAccountId);

        // Insert new stock audit for the product
        //===========================================================================================================
        await ManageProductStockAudit(productStockPerPanelFromRepo, productInput);

        // Commit transaction if all operations succeed
        await transaction.CommitAsync();
      }
      catch
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync();
        throw;
      }

      return product;
    }

    private async Task<ProductUnit> ManageProductUnit(string unitName)
    {
      var productUnitFromRepo = await _productUnitRepository.GetProductUnitByName(unitName);

      if (productUnitFromRepo == null)
      {
        productUnitFromRepo = new ProductUnit
        {
          Name = unitName
        };

        _beelinaRepository.ClientDbContext.ProductUnits.Add(productUnitFromRepo);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync();
      }

      return productUnitFromRepo;
    }

    private async Task<ProductStockPerPanel> ManageProductStockPerPanel(Product product, ProductInput productInput, int userAccountId)
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
      await _beelinaRepository.ClientDbContext.SaveChangesAsync();

      return productStockPerPanelFromRepo;
    }

    private async Task ManageProductStockAudit(ProductStockPerPanel productStockPerPanel, ProductInput productInput)
    {
      if (productInput.StockQuantity != 0)
      {
        var productStockAudit = new ProductStockAudit
        {
          ProductStockPerPanelId = productStockPerPanel.Id,
          Quantity = productInput.StockQuantity,
          StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
          WithdrawalSlipNo = productInput.WithdrawalSlipNo
        };

        if (productStockAudit.Id == 0)
          await _beelinaRepository.ClientDbContext.ProductStockAudits.AddAsync(productStockAudit);
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
                                      .FirstOrDefaultAsync();
      return productStockAuditsFromRepo
            .ProductStockAudits
            .Where(pa => pa.StockAuditSource == StockAuditSourceEnum.FromWithdrawal)
            .OrderByDescending(ps => ps.DateCreated)
            .ToList();
    }

    public async Task<List<ProductStockAuditItem>> GetProductStockAuditItems(int productId, int userAccountId, StockAuditSourceEnum stockAuditSource, string fromDate, string toDate)
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
                                                   ModifiedDate = tj.DateCreated
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

    public async Task<ProductStockAudit> GetProductStockAudit(int productStockAuditId)
    {
      var productStockAuditFromRepo = await _beelinaRepository.ClientDbContext.ProductStockAudits
                                      .Where(pp => pp.Id == productStockAuditId)
                                      .FirstOrDefaultAsync();
      return productStockAuditFromRepo;
    }

    public async Task<Product> TransferProductStockFromOwnInventory(
      int userAccountId,
      int sourceProductId,
      int destinationProductId,
      int destinationProductNumberOfUnits,
      int sourceProductNumberOfUnits,
      int sourceNumberOfUnitsTransfered,
      TransferProductStockTypeEnum transferProductStockType)
    {
      SetCurrentUserId(userAccountId);

      var sourceProductFromRepo = await GetProducts(userAccountId, sourceProductId);
      var destinationProductFromRepo = await GetProducts(userAccountId, destinationProductId);

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
            WithdrawalSlipNo = String.Empty
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
            WithdrawalSlipNo = String.Empty
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
          WithdrawalSlipNo = String.Empty
        };
        await _beelinaRepository.ClientDbContext.ProductStockAudits.AddAsync(sourceProductStockAudit);
        await _beelinaRepository.ClientDbContext.SaveChangesAsync();
        await transaction.CommitAsync();
      }
      catch
      {
        // Rollback the transaction if any operation fails
        await transaction.RollbackAsync();
        throw;
      }

      return sourceProductFromRepo[0];
    }
  }
}