using AutoMapper;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class ProductQuery
    {
        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Product>> GetProducts([Service] IProductRepository<Product> productRepository)
        {
            return await productRepository.GetAllEntities().Includes(p => p.ProductUnit).ToListObjectAsync();
        }

        [Authorize]
        public async Task<IProductPayload> GetProduct([Service] IProductRepository<Product> productRepository, [Service] IMapper mapper, int productId)
        {
            var productFromRepo = await productRepository.GetEntity(productId).Includes(s => s.ProductUnit).ToObjectAsync();

            var productResult = mapper.Map<ProductInformationResult>(productFromRepo);

            if (productFromRepo == null)
            {
                return new ProductNotExistsError(productId);
            }

            return productResult;
        }

        [Authorize]
        public async Task<IProductPayload> CheckProductCode([Service] IProductRepository<Product> productRepository, [Service] IMapper mapper, int productId, string productCode)
        {
            var productFromRepo = await productRepository.GetProductByUniqueCode(productId, productCode);
            return new CheckProductCodeInformationResult((productFromRepo != null));
        }
    }
}
