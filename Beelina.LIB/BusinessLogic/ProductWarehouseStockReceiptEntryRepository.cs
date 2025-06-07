using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using Beelina.LIB.Helpers.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Beelina.LIB.GraphQL.Results;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductWarehouseStockReceiptEntryRepository
        : BaseRepository<ProductWarehouseStockReceiptEntry>, IProductWarehouseStockReceiptEntryRepository<ProductWarehouseStockReceiptEntry>
    {
        private readonly IOptions<ApplicationSettings> _appSettings;

        public ProductWarehouseStockReceiptEntryRepository(IBeelinaRepository<ProductWarehouseStockReceiptEntry> beelinaRepository, IOptions<ApplicationSettings> appSettings)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            _appSettings = appSettings;
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
                                                         Quantity = a.Quantity
                                                     }).ToList();

            var productStockPerWarehouseResult = new ProductWarehouseStockReceiptEntryResult
            {
                Id = productStockPerWarehouseFromRepo.Id,
                ReferenceNo = productStockPerWarehouseFromRepo.ReferenceNo,
                StockEntryDate = productStockPerWarehouseFromRepo.StockEntryDate,
                SupplierId = productStockPerWarehouseFromRepo.SupplierId,
                Notes = productStockPerWarehouseFromRepo.Notes,
                PlateNo = productStockPerWarehouseFromRepo.PlateNo,
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
    }
}
