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
            var productsFromRepo = (from p in _beelinaRepository.ClientDbContext.Products
                                    join pp in _beelinaRepository.ClientDbContext.ProductStockPerPanels

                                    on new { Id = p.Id, UserAccountId = userId } equals new { Id = pp.ProductId, UserAccountId = pp.UserAccountId }
                                    into productStockJoin
                                    from pp in productStockJoin.DefaultIfEmpty()

                                    join pu in _beelinaRepository.ClientDbContext.ProductUnits
                                        on p.ProductUnitId equals pu.Id
                                        into productUnitJoin
                                    from pu in productUnitJoin.DefaultIfEmpty()

                                    where p.IsDelete == false

                                    select new Product
                                    {
                                        Id = p.Id,
                                        Name = p.Name,
                                        Code = p.Code,
                                        Description = p.Description,
                                        StockQuantity = (pp == null ? 0 : pp.StockQuantity),
                                        PricePerUnit = (pp == null ? 0 : pp.PricePerUnit),
                                        ProductUnitId = p.ProductUnitId,
                                        ProductUnit = pu
                                    });

            if (productId > 0)
            {
                return await productsFromRepo.Where(p => p.Id == productId).ToListAsync();
            }

            return await productsFromRepo.ToListAsync();
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
