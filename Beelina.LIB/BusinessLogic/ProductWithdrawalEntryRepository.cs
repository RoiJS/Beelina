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
    public class ProductWithdrawalEntryRepository
        : BaseRepository<ProductWithdrawalEntry>, IProductWithdrawalEntryRepository<ProductWithdrawalEntry>
    {
        private readonly IOptions<ApplicationSettings> _appSettings;
        private readonly IProductRepository<Product> _productRepository;

        public ProductWithdrawalEntryRepository(
            IBeelinaRepository<ProductWithdrawalEntry> beelinaRepository, 
            IOptions<ApplicationSettings> appSettings,
            IProductRepository<Product> productRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            _appSettings = appSettings;
            _productRepository = productRepository;
        }

        public async Task<ProductWithdrawalEntryResult> GetProductWithdrawalEntry(int productWithdrawalEntryId, CancellationToken cancellationToken = default)
        {
            var productWithdarawalFromRepo = await _beelinaRepository
                                    .ClientDbContext
                                    .ProductWithdrawalEntries
                                    .Where((p) => p.Id == productWithdrawalEntryId)
                                    .Include((p) => p.ProductStockAudits)
                                    .FirstOrDefaultAsync();

            var productStockPerPanel = await _beelinaRepository.ClientDbContext.ProductStockPerPanels.ToListAsync();

            var productWithdrawalAuditResults = (from a in productWithdarawalFromRepo.ProductStockAudits.ToList()
                                                 join b in productStockPerPanel

                                                 on new { Id = a.ProductStockPerPanelId } equals new { Id = b.Id }
                                                 into productStockPerWarehouseAuditJoin
                                                 from b in productStockPerWarehouseAuditJoin.DefaultIfEmpty()

                                                 select new ProductWithdrawalAuditResult
                                                 {
                                                     Id = a.Id,
                                                     ProductId = b.ProductId,
                                                     ProductWithdrawalEntryId = productWithdrawalEntryId,
                                                     ProductStockPerPanelId = b.Id,
                                                     StockAuditSource = a.StockAuditSource,
                                                     Quantity = a.Quantity,
                                                     WarehouseId = a.WarehouseId
                                                 }).ToList();

            var productWithdrawalResult = new ProductWithdrawalEntryResult
            {
                Id = productWithdarawalFromRepo.Id,
                WithdrawalSlipNo = productWithdarawalFromRepo.WithdrawalSlipNo,
                StockEntryDate = productWithdarawalFromRepo.StockEntryDate,
                Notes = productWithdarawalFromRepo.Notes,
                UserAccountId = productWithdarawalFromRepo.UserAccountId,
                ProductWithdrawalAuditsResult = productWithdrawalAuditResults,
            };

            return productWithdrawalResult;
        }

        public async Task<List<ProductWithdrawalEntry>> GetProductWithdarawalEntries(ProductWithdrawalFilter productWithdrawalEntryFilter, string filterKeyword = "", CancellationToken cancellationToken = default)
        {
            var productWithdrawalEntriesFromRepo = _beelinaRepository
                                    .ClientDbContext
                                    .ProductWithdrawalEntries
                                    .Include(t => t.UserAccount)
                                    .Where((p) =>
                                        (productWithdrawalEntryFilter == null ||
                                            (productWithdrawalEntryFilter != null &&
                                                (
                                                    ((productWithdrawalEntryFilter.UserAccountId == 0) || (productWithdrawalEntryFilter.UserAccountId > 0 && p.UserAccountId == productWithdrawalEntryFilter.UserAccountId))
                                                )
                                            )
                                        )
                                        && p.Id != 1 // Exclude default entry
                                    );

            if (!String.IsNullOrEmpty(productWithdrawalEntryFilter.DateFrom) || !String.IsNullOrEmpty(productWithdrawalEntryFilter.DateTo))
            {
                if (!String.IsNullOrEmpty(productWithdrawalEntryFilter.DateFrom))
                {
                    productWithdrawalEntriesFromRepo = productWithdrawalEntriesFromRepo.Where(t => t.StockEntryDate >= Convert.ToDateTime(productWithdrawalEntryFilter.DateFrom));
                }

                if (!String.IsNullOrEmpty(productWithdrawalEntryFilter.DateTo))
                {
                    productWithdrawalEntriesFromRepo = productWithdrawalEntriesFromRepo.Where(t => t.StockEntryDate <= Convert.ToDateTime(productWithdrawalEntryFilter.DateTo));
                }
            }

            var productWithdrawalEntries = await productWithdrawalEntriesFromRepo.
                        Select(t => new ProductWithdrawalEntry
                        {
                            Id = t.Id,
                            UserAccountId = t.UserAccountId,
                            UserAccount = t.UserAccount,
                            WithdrawalSlipNo = t.WithdrawalSlipNo,
                            Notes = t.Notes,
                            StockEntryDate = t.StockEntryDate, // TODO: Apply timezone conversion here
                        }).
                        ToListAsync(cancellationToken);

            if (!String.IsNullOrEmpty(filterKeyword))
            {
                productWithdrawalEntries = [.. productWithdrawalEntries.Where((p => p.WithdrawalSlipNo.IsMatchAnyKeywords(filterKeyword) || p.WithdrawalSlipNo.IsMatchAnyKeywords(filterKeyword)))];
            }

            return productWithdrawalEntries;
        }

        public async Task<ProductWithdrawalEntry> GetProductWithdrawalByUniqueCode(int productWithdrawalId, string withdrawalSlipNo)
        {
            var productWithdrawalFromRepo = await _beelinaRepository
                                      .ClientDbContext
                                      .ProductWithdrawalEntries
                                      .Where((p) =>
                                          p.Id != productWithdrawalId &&
                                          p.WithdrawalSlipNo == withdrawalSlipNo &&
                                          p.IsActive &&
                                          !p.IsDelete
                                      ).FirstOrDefaultAsync();

            return productWithdrawalFromRepo;
        }

        public async Task<string> GetLastProductWithdrawalCode(CancellationToken cancellationToken = default)
        {
            var productWithdrawalEntries = _beelinaRepository.ClientDbContext.ProductWithdrawalEntries;
            var lastEntry = await productWithdrawalEntries.OrderByDescending(x => x.Id).FirstOrDefaultAsync(cancellationToken);
            return lastEntry != null ? lastEntry.WithdrawalSlipNo : string.Empty;
        }

        public async Task<List<ProductWithdrawalEntry>> UpdateProductWithdrawalEntriesWithBusinessLogic(
            List<ProductWithdrawalEntryInput> productWithdrawalEntryInputs,
            CancellationToken cancellationToken = default)
        {
            var updatedEntries = new List<ProductWithdrawalEntry>();

            using var transaction = _beelinaRepository.ClientDbContext.Database.BeginTransaction();
            try
            {
                foreach (var input in productWithdrawalEntryInputs)
                {
                    var withdrawalEntryFromRepo = await GetEntity(input.Id)
                                                .Includes(s => s.ProductStockAudits)
                                                .ToObjectAsync();

                    await SetProductStockPanels(input, _productRepository, cancellationToken);

                    if (withdrawalEntryFromRepo is null)
                    {
                        var newStockEntry = MapInputToEntity(input);
                        var newStockEntryItems = MapInputsToAudits(input.ProductStockAuditsInputs);

                        newStockEntry.ProductStockAudits = newStockEntryItems;

                        await AddEntity(newStockEntry);
                        updatedEntries.Add(newStockEntry);
                    }
                    else
                    {
                        MapInputToExistingEntity(input, withdrawalEntryFromRepo);
                        withdrawalEntryFromRepo.ProductStockAudits = UpdateAuditEntities(input.ProductStockAuditsInputs, withdrawalEntryFromRepo.ProductStockAudits);
                        updatedEntries.Add(withdrawalEntryFromRepo);
                    }
                }

                await SaveChanges(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return updatedEntries;
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        private static async Task SetProductStockPanels(ProductWithdrawalEntryInput productWithdrawalEntryInput, IProductRepository<Product> productRepository, CancellationToken cancellationToken)
        {
            foreach (var productStockAudit in productWithdrawalEntryInput.ProductStockAuditsInputs)
            {
                var product = new Product
                {
                    Id = productStockAudit.ProductId
                };

                var productInput = new ProductInput
                {
                    Id = productStockAudit.ProductId,
                    PricePerUnit = productStockAudit.PricePerUnit
                };

                var productStockPerPanel = await productRepository.ManageProductStockPerPanel(product, productInput, productWithdrawalEntryInput.UserAccountId, cancellationToken);

                productStockAudit.ProductStockPerPanelId = productStockPerPanel.Id;
            }
        }

        private static ProductWithdrawalEntry MapInputToEntity(ProductWithdrawalEntryInput input)
        {
            return new ProductWithdrawalEntry
            {
                Id = input.Id,
                UserAccountId = input.UserAccountId,
                StockEntryDate = DateTime.TryParse(input.StockEntryDate, out var date) ? date : null,
                WithdrawalSlipNo = input.WithdrawalSlipNo,
                Notes = input.Notes,
                IsActive = true,
                IsDelete = false
            };
        }

        private static List<ProductStockAudit> MapInputsToAudits(List<ProductStockAuditInput> inputs)
        {
            return inputs.Select(input => new ProductStockAudit
            {
                Id = input.Id,
                ProductStockPerPanelId = input.ProductStockPerPanelId ?? 0,
                StockAuditSource = input.StockAuditSource,
                Quantity = input.Quantity,
                WarehouseId = input.WarehouseId,
                IsActive = true,
                IsDelete = false
            }).ToList();
        }

        private static void MapInputToExistingEntity(ProductWithdrawalEntryInput input, ProductWithdrawalEntry existing)
        {
            existing.UserAccountId = input.UserAccountId;
            existing.StockEntryDate = DateTime.TryParse(input.StockEntryDate, out var date) ? date : null;
            existing.WithdrawalSlipNo = input.WithdrawalSlipNo;
            existing.Notes = input.Notes;
        }

        private static List<ProductStockAudit> UpdateAuditEntities(List<ProductStockAuditInput> inputs, List<ProductStockAudit> existing)
        {
            var result = new List<ProductStockAudit>();

            foreach (var input in inputs)
            {
                var existingAudit = existing.FirstOrDefault(e => e.Id == input.Id);
                if (existingAudit != null)
                {
                    // Update existing
                    existingAudit.ProductStockPerPanelId = input.ProductStockPerPanelId ?? 0;
                    existingAudit.StockAuditSource = input.StockAuditSource;
                    existingAudit.Quantity = input.Quantity;
                    existingAudit.WarehouseId = input.WarehouseId;
                    result.Add(existingAudit);
                }
                else
                {
                    // Add new
                    result.Add(new ProductStockAudit
                    {
                        Id = input.Id,
                        ProductStockPerPanelId = input.ProductStockPerPanelId ?? 0,
                        StockAuditSource = input.StockAuditSource,
                        Quantity = input.Quantity,
                        WarehouseId = input.WarehouseId,
                        IsActive = true,
                        IsDelete = false
                    });
                }
            }

            // Apply the same logic as AutoMapperExtensions: only keep entities that exist in the input list or have Id == 0 (new entities)
            var finalEntities = result.Where(x => inputs.Exists(y => y.Id == x.Id) || x.Id == 0).ToList();

            return finalEntities;
        }
    }
}
