using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class ProductQuery
    {
        [Authorize]
        [UsePaging]
        [UseProjection]
        public async Task<IList<Product>> GetProducts([Service] IProductRepository<Product> productRepository)
        {
            return await productRepository.GetAllEntities().ToListObjectAsync();
        }
    }
}
