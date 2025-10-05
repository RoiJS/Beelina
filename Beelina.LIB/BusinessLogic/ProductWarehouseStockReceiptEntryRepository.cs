using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using Beelina.LIB.Helpers.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductWarehouseStockReceiptEntryRepository
        : BaseRepository<ProductWarehouseStockReceiptEntry>, IProductWarehouseStockReceiptEntryRepository<ProductWarehouseStockReceiptEntry>
    {
        private readonly IOptions<ApplicationSettings> _appSettings;
        private readonly IProductRepository<Product> _productRepository;

        public ProductWarehouseStockReceiptEntryRepository(
            IBeelinaRepository<ProductWarehouseStockReceiptEntry> beelinaRepository,
            IOptions<ApplicationSettings> appSettings,
            IProductRepository<Product> productRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            _appSettings = appSettings;
            _productRepository = productRepository;
        }

        public async Task<ProductWarehouseStockReceiptEntry> UpdateProductWarehouseStockReceiptEntry(ProductWarehouseStockReceiptEntry productWarehouseStockReceiptEntry)
        {
            if (productWarehouseStockReceiptEntry.Id == 0)
                await AddEntity(productWarehouseStockReceiptEntry);
            else
                await SaveChanges();

            return productWarehouseStockReceiptEntry;
        }

        public async Task<ProductWarehouseStockReceiptEntryResult> GetProductWarehouseStockReceiptEntry(int productWarehouseStockReceiptEntryId, CancellationToken cancellationToken = default)
        {
            var productStockPerWarehouseFromRepo = await _beelinaRepository
                                    .ClientDbContext
                                    .ProductWarehouseStockReceiptEntries
                                    .Where((p) => p.Id == productWarehouseStockReceiptEntryId)
                                    .Include((p) => p.ProductStockWarehouseAudits)
                                    .Include((p) => p.Discounts)
                                    .FirstOrDefaultAsync();

            var productStockPerWarehouse = await _beelinaRepository.ClientDbContext.ProductStockPerWarehouse.ToListAsync();

            var productStockWarehouseAuditResults = (from a in productStockPerWarehouseFromRepo.ProductStockWarehouseAudits.ToList()
                                                     join b in productStockPerWarehouse

                                                     on new { Id = a.ProductStockPerWarehouseId } equals new { Id = b.Id }
                                                     into productStockPerWarehouseAuditJoin
                                                     from b in productStockPerWarehouseAuditJoin.DefaultIfEmpty()

                                                     select new ProductStockWarehouseAuditResult
                                                     {
                                                         Id = a.Id,
                                                         ProductId = b.ProductId,
                                                         ProductStockPerWarehouseId = b.Id,
                                                         StockAuditSource = a.StockAuditSource,
                                                         Quantity = a.Quantity,
                                                         ExpirationDate = a.ExpirationDate,
                                                     }).ToList();

            var productStockPerWarehouseResult = new ProductWarehouseStockReceiptEntryResult
            {
                Id = productStockPerWarehouseFromRepo.Id,
                ReferenceNo = productStockPerWarehouseFromRepo.ReferenceNo,
                StockEntryDate = productStockPerWarehouseFromRepo.StockEntryDate,
                SupplierId = productStockPerWarehouseFromRepo.SupplierId,
                Notes = productStockPerWarehouseFromRepo.Notes,
                PlateNo = productStockPerWarehouseFromRepo.PlateNo,
                WarehouseId = productStockPerWarehouseFromRepo.WarehouseId,
                InvoiceNo = productStockPerWarehouseFromRepo.InvoiceNo,
                InvoiceDate = productStockPerWarehouseFromRepo.InvoiceDate,
                DateEncoded = productStockPerWarehouseFromRepo.DateEncoded,
                PurchaseOrderStatus = productStockPerWarehouseFromRepo.PurchaseOrderStatus,
                Location = productStockPerWarehouseFromRepo.Location,
                Discounts = productStockPerWarehouseFromRepo.Discounts,
                ProductStockWarehouseAuditsResult = productStockWarehouseAuditResults,
            };

            return productStockPerWarehouseResult;
        }

        public async Task<List<ProductWarehouseStockReceiptEntry>> GetProductWarehouseStockReceiptEntries(ProductReceiptEntryFilter productReceiptEntryFilter, string filterKeyword = "", CancellationToken cancellationToken = default)
        {
            var productWarehouseStockReceiptEntriesFromRepo = _beelinaRepository
                                    .ClientDbContext
                                    .ProductWarehouseStockReceiptEntries
                                    .Include(t => t.Supplier)
                                    .Include(t => t.Discounts)
                                    .Where((p) =>
                                        (productReceiptEntryFilter == null ||
                                            (productReceiptEntryFilter != null &&
                                                (
                                                    ((productReceiptEntryFilter.SupplierId == 0) || (productReceiptEntryFilter.SupplierId > 0 && p.SupplierId == productReceiptEntryFilter.SupplierId)) &&
                                                    ((productReceiptEntryFilter.WarehouseId == 0) || (productReceiptEntryFilter.WarehouseId > 0 && p.WarehouseId == productReceiptEntryFilter.WarehouseId))
                                                )
                                            )
                                        )
                                        && p.Id != 1 // Exclude default
                                    );

            if (!String.IsNullOrEmpty(productReceiptEntryFilter.DateFrom) || !String.IsNullOrEmpty(productReceiptEntryFilter.DateTo))
            {
                if (!String.IsNullOrEmpty(productReceiptEntryFilter.DateFrom))
                {
                    productWarehouseStockReceiptEntriesFromRepo = productWarehouseStockReceiptEntriesFromRepo.Where(t => t.StockEntryDate >= Convert.ToDateTime(productReceiptEntryFilter.DateFrom));
                }

                if (!String.IsNullOrEmpty(productReceiptEntryFilter.DateTo))
                {
                    productWarehouseStockReceiptEntriesFromRepo = productWarehouseStockReceiptEntriesFromRepo.Where(t => t.StockEntryDate <= Convert.ToDateTime(productReceiptEntryFilter.DateTo));
                }
            }

            var productWarehouseStockReceiptEntries = await productWarehouseStockReceiptEntriesFromRepo.
                        Select(t => new ProductWarehouseStockReceiptEntry
                        {
                            Id = t.Id,
                            SupplierId = t.SupplierId,
                            Supplier = t.Supplier,
                            ReferenceNo = t.ReferenceNo,
                            PlateNo = t.PlateNo,
                            WarehouseId = t.WarehouseId,
                            Notes = t.Notes,
                            StockEntryDate = t.StockEntryDate, // TODO: Apply timezone conversion here
                            Discounts = t.Discounts,
                            InvoiceNo = t.InvoiceNo,
                            InvoiceDate = t.InvoiceDate,
                            DateEncoded = t.DateEncoded,
                            PurchaseOrderStatus = t.PurchaseOrderStatus,
                            Location = t.Location,
                        }).
                        ToListAsync(cancellationToken);

            if (!String.IsNullOrEmpty(filterKeyword))
            {
                productWarehouseStockReceiptEntries = productWarehouseStockReceiptEntries
                                .Where((p => p.ReferenceNo.IsMatchAnyKeywords(filterKeyword) || p.PlateNo.IsMatchAnyKeywords(filterKeyword)))
                                .ToList();
            }

            return productWarehouseStockReceiptEntries;
        }

        public async Task<ProductWarehouseStockReceiptEntry> GetPurchaseOrderByUniqueCode(int purchaseOrderId, string referenceCode)
        {
            var purchaseOrerFromRepo = await _beelinaRepository
                                      .ClientDbContext
                                      .ProductWarehouseStockReceiptEntries
                                      .Where((p) =>
                                          p.Id != purchaseOrderId &&
                                          p.ReferenceNo == referenceCode &&
                                          p.IsActive &&
                                          !p.IsDelete
                                      ).FirstOrDefaultAsync();

            return purchaseOrerFromRepo;
        }

        public async Task<string> GetStockEntryLatestReferenceNo(CancellationToken cancellationToken = default)
        {
            var productWarehouseStockReceiptEntries = _beelinaRepository.ClientDbContext.ProductWarehouseStockReceiptEntries;
            var latestEntry = await productWarehouseStockReceiptEntries.OrderByDescending(x => x.Id).FirstOrDefaultAsync(cancellationToken);
            return latestEntry != null ? latestEntry.ReferenceNo : string.Empty;
        }

        public async Task<List<ProductWarehouseStockReceiptEntry>> UpdateProductWarehouseStockReceiptEntriesBatch(List<ProductWarehouseStockReceiptEntryInput> productWarehouseStockReceiptEntryInputs, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var updatedEntries = new List<ProductWarehouseStockReceiptEntry>();
            var warehouseId = 1; // Default warehouse ID

            foreach (var input in productWarehouseStockReceiptEntryInputs)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var stockEntryFromRepo = await _beelinaRepository
                                            .GetEntity(input.Id)
                                            .Includes(s => s.ProductStockWarehouseAudits, s => s.Discounts)
                                            .ToObjectAsync();

                await SetProductStockWarehouses(input, warehouseId, _productRepository, cancellationToken);

                if (stockEntryFromRepo is null)
                {
                    var newStockEntry = MapInputToEntity(input);
                    var newStockEntryItems = MapAuditInputsToEntities(input.ProductStockWarehouseAuditInputs, 0);
                    var newDiscounts = MapDiscountInputsToEntities(input.Discounts, 0);

                    newStockEntry.ProductStockWarehouseAudits = newStockEntryItems;
                    newStockEntry.Discounts = newDiscounts;

                    await AddEntity(newStockEntry);
                    updatedEntries.Add(newStockEntry);
                }
                else
                {
                    MapInputToEntity(input, stockEntryFromRepo);
                    stockEntryFromRepo.ProductStockWarehouseAudits = MapAuditEntities(input.ProductStockWarehouseAuditInputs, stockEntryFromRepo.ProductStockWarehouseAudits, stockEntryFromRepo.Id);
                    stockEntryFromRepo.Discounts = MapDiscountEntities(input.Discounts, stockEntryFromRepo.Discounts, stockEntryFromRepo.Id);
                    updatedEntries.Add(stockEntryFromRepo);
                }
            }

            await SaveChanges(cancellationToken);
            return updatedEntries;
        }

        private static ProductWarehouseStockReceiptEntry MapInputToEntity(ProductWarehouseStockReceiptEntryInput input)
        {
            return new ProductWarehouseStockReceiptEntry
            {
                Id = input.Id,
                SupplierId = input.SupplierId,
                StockEntryDate = DateTime.TryParse(input.StockEntryDate, out var stockEntryDate) ? stockEntryDate : DateTime.Now,
                ReferenceNo = input.ReferenceNo,
                PlateNo = input.PlateNo,
                WarehouseId = input.WarehouseId,
                Notes = input.Notes,
                InvoiceNo = input.InvoiceNo,
                InvoiceDate = DateTime.TryParse(input.InvoiceDate, out var invoiceDate) ? invoiceDate : null,
                DateEncoded = DateTime.TryParse(input.DateEncoded, out var dateEncoded) ? dateEncoded : null,
                PurchaseOrderStatus = input.PurchaseOrderStatus,
                Location = input.Location,
                IsActive = true,
                IsDelete = false,
                DateCreated = DateTime.Now,
                DateUpdated = DateTime.Now
            };
        }

        private static void MapInputToEntity(ProductWarehouseStockReceiptEntryInput input, ProductWarehouseStockReceiptEntry entity)
        {
            entity.SupplierId = input.SupplierId;
            entity.StockEntryDate = DateTime.TryParse(input.StockEntryDate, out var stockEntryDate) ? stockEntryDate : entity.StockEntryDate;
            entity.ReferenceNo = input.ReferenceNo;
            entity.PlateNo = input.PlateNo;
            entity.WarehouseId = input.WarehouseId;
            entity.Notes = input.Notes;
            entity.InvoiceNo = input.InvoiceNo;
            entity.InvoiceDate = DateTime.TryParse(input.InvoiceDate, out var invoiceDate) ? invoiceDate : entity.InvoiceDate;
            entity.DateEncoded = DateTime.TryParse(input.DateEncoded, out var dateEncoded) ? dateEncoded : entity.DateEncoded;
            entity.PurchaseOrderStatus = input.PurchaseOrderStatus;
            entity.Location = input.Location;
            entity.DateUpdated = DateTime.Now;
        }

        private static List<ProductStockWarehouseAudit> MapAuditInputsToEntities(List<ProductStockWarehouseAuditInput> inputs, int parentId = 0)
        {
            return [.. inputs.Select(input => new ProductStockWarehouseAudit
            {
                Id = input.Id,
                ProductStockPerWarehouseId = input.ProductStockPerWarehouseId,
                ProductWarehouseStockReceiptEntryId = parentId > 0 ? parentId : 0, // Will be set later for new entries
                Quantity = input.Quantity,
                StockAuditSource = input.StockAuditSource,
                ExpirationDate = input.ExpirationDate,
                IsActive = true,
                IsDelete = false,
                DateCreated = DateTime.Now,
                DateUpdated = DateTime.Now
            })];
        }

        private static List<ProductStockWarehouseAudit> MapAuditEntities(List<ProductStockWarehouseAuditInput> inputs, List<ProductStockWarehouseAudit> existingEntities, int parentId = 0)
        {
            var updatedEntities = new List<ProductStockWarehouseAudit>();

            foreach (var input in inputs)
            {
                var existingEntity = existingEntities.FirstOrDefault(e => e.Id == input.Id);
                if (existingEntity != null)
                {
                    // Update existing entity
                    existingEntity.ProductStockPerWarehouseId = input.ProductStockPerWarehouseId;
                    existingEntity.ProductWarehouseStockReceiptEntryId = parentId > 0 ? parentId : input.ProductWarehouseStockReceiptEntryId;
                    existingEntity.Quantity = input.Quantity;
                    existingEntity.StockAuditSource = input.StockAuditSource;
                    existingEntity.ExpirationDate = input.ExpirationDate;
                    existingEntity.DateUpdated = DateTime.Now;
                    updatedEntities.Add(existingEntity);
                }
                else
                {
                    // Add new entity
                    var newEntity = new ProductStockWarehouseAudit
                    {
                        Id = input.Id,
                        ProductStockPerWarehouseId = input.ProductStockPerWarehouseId,
                        ProductWarehouseStockReceiptEntryId = parentId > 0 ? parentId : input.ProductWarehouseStockReceiptEntryId,
                        Quantity = input.Quantity,
                        StockAuditSource = input.StockAuditSource,
                        ExpirationDate = input.ExpirationDate,
                        IsActive = true,
                        IsDelete = false,
                        DateCreated = DateTime.Now,
                        DateUpdated = DateTime.Now
                    };
                    updatedEntities.Add(newEntity);
                }
            }

            var finalEntities = updatedEntities.Where(x => existingEntities.Exists(y => y.Id == x.Id) || x.Id == 0).ToList();

            return finalEntities;
        }

        private static async Task SetProductStockWarehouses(ProductWarehouseStockReceiptEntryInput productWarehouseStockReceiptEntryInput, int warehouseId, IProductRepository<Product> productRepository, CancellationToken cancellationToken)
        {
            foreach (var productStockWarehouseAudit in productWarehouseStockReceiptEntryInput.ProductStockWarehouseAuditInputs)
            {
                var product = new Product
                {
                    Id = productStockWarehouseAudit.ProductId
                };

                var productInput = new ProductInput
                {
                    Id = productStockWarehouseAudit.ProductId,
                    PricePerUnit = productStockWarehouseAudit.PricePerUnit,
                    CostPrice = productStockWarehouseAudit.CostPrice
                };

                var productStockPerWarehouse = await productRepository.ManageProductStockPerWarehouse(product, productInput, warehouseId, cancellationToken);

                productStockWarehouseAudit.ProductStockPerWarehouseId = productStockPerWarehouse.Id;
            }
        }

        private static List<ProductWarehouseStockReceiptDiscount> MapDiscountInputsToEntities(List<ProductWarehouseStockReceiptDiscountInput> inputs, int parentId = 0)
        {
            if (inputs == null || !inputs.Any())
                return new List<ProductWarehouseStockReceiptDiscount>();

            return inputs.Select(input => new ProductWarehouseStockReceiptDiscount
            {
                Id = input.Id,
                ProductWarehouseStockReceiptEntryId = parentId > 0 ? parentId : 0, // Will be set later for new entries
                DiscountPercentage = input.DiscountPercentage,
                DiscountOrder = input.DiscountOrder,
                Description = input.Description
            }).ToList();
        }

        private static List<ProductWarehouseStockReceiptDiscount> MapDiscountEntities(List<ProductWarehouseStockReceiptDiscountInput> inputs, List<ProductWarehouseStockReceiptDiscount> existingEntities, int parentId = 0)
        {
            if (inputs == null)
                inputs = new List<ProductWarehouseStockReceiptDiscountInput>();

            if (existingEntities == null)
                existingEntities = new List<ProductWarehouseStockReceiptDiscount>();

            var updatedEntities = new List<ProductWarehouseStockReceiptDiscount>();

            // Update existing entities and add new ones
            foreach (var input in inputs)
            {
                var existingEntity = existingEntities.FirstOrDefault(e => e.Id == input.Id);
                if (existingEntity != null)
                {
                    // Update existing entity
                    existingEntity.ProductWarehouseStockReceiptEntryId = parentId > 0 ? parentId : input.Id;
                    existingEntity.DiscountPercentage = input.DiscountPercentage;
                    existingEntity.DiscountOrder = input.DiscountOrder;
                    existingEntity.Description = input.Description;
                    updatedEntities.Add(existingEntity);
                }
                else
                {
                    // Add new entity
                    var newEntity = new ProductWarehouseStockReceiptDiscount
                    {
                        Id = input.Id,
                        ProductWarehouseStockReceiptEntryId = parentId > 0 ? parentId : 0,
                        DiscountPercentage = input.DiscountPercentage,
                        DiscountOrder = input.DiscountOrder,
                        Description = input.Description,
                    };
                    updatedEntities.Add(newEntity);
                }
            }

            var finalEntities = updatedEntities.Where(x => existingEntities.Exists(y => y.Id == x.Id) || x.Id == 0).ToList();

            return finalEntities;
        }
    }
}
