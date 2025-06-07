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
    public class ProductWithdrawalEntryRepository
        : BaseRepository<ProductWithdrawalEntry>, IProductWithdrawalEntryRepository<ProductWithdrawalEntry>
    {
        private readonly IOptions<ApplicationSettings> _appSettings;

        public ProductWithdrawalEntryRepository(IBeelinaRepository<ProductWithdrawalEntry> beelinaRepository, IOptions<ApplicationSettings> appSettings)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
            _appSettings = appSettings;
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
    }
}
