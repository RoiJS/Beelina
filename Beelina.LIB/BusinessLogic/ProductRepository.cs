using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductRepository
        : BaseRepository<Product>, IProductRepository<Product>
    {

        public ProductRepository(IBeelinaRepository<Product> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }

        public async Task<IList<Product>> GetProducts(int userId, int productId)
        {
            // Gather products information with product stock per panel and product unit.
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

                                          select new
                                          {
                                              Id = p.Id,
                                              ProductPerPanelId = (pp == null ? 0 : pp.Id),
                                              Name = p.Name,
                                              Code = p.Code,
                                              Description = p.Description,
                                              PricePerUnit = (pp == null ? 0 : pp.PricePerUnit),
                                              ProductUnitId = p.ProductUnitId,
                                              ProductUnit = pu
                                          }).ToListAsync();


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
            var productsStocksAuditsPerProductPanel = (from p in productsFromRepo
                                                       join ps in productStockAudits

                                                       on new { Id = p.ProductPerPanelId } equals new { Id = ps.ProductStockPerPanelId }
                                                       into productStockAuditJoin
                                                       from ps in productStockAuditJoin.DefaultIfEmpty()

                                                       select new
                                                       {
                                                           Id = p.Id,
                                                           ProductPerPanelId = p.ProductPerPanelId,
                                                           Name = p.Name,
                                                           Code = p.Code,
                                                           Description = p.Description,
                                                           PricePerUnit = p.PricePerUnit,
                                                           ProductUnitId = p.ProductUnitId,
                                                           ProductUnit = p.ProductUnit,
                                                           StockAbsoluteQuantity = (ps == null ? 0 : ps.Quantity)
                                                       }).ToList();


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
                                             Description = p.Description,
                                             PricePerUnit = p.PricePerUnit,
                                             ProductUnitId = p.ProductUnitId,
                                             ProductUnit = p.ProductUnit,
                                             StockQuantity = p.StockAbsoluteQuantity - (pt == null ? 0 : pt.Quantity),
                                         }).ToList();

            return finalProductsFromRepo;
        }


        public async Task<Product> RegisterProduct(Product product)
        {
            await AddEntity(product);

            return product;
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
            var productFromRepo = await _beelinaRepository.ClientDbContext.Products.Where((p) => p.Code == productCode).FirstOrDefaultAsync();
            return productFromRepo;
        }
    }
}
