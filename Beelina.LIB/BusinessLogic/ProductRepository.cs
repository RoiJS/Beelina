using Beelina.LIB.Enums;
using Beelina.LIB.Helpers;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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
    }
}
