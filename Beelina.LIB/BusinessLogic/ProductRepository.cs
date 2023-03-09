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

    }
}
