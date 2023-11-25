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
        [UsePaging(MaxPageSize = 50, DefaultPageSize = 50)]
        [UseProjection]
        [UseFiltering]
        public async Task<IList<Product>> GetProducts([Service] IProductRepository<Product> productRepository, int userAccountId, string filterKeyword = "")
        {
            return await productRepository.GetProducts(userAccountId, 0, filterKeyword);
        }

        [Authorize]
        public async Task<IProductPayload> GetProduct([Service] IProductRepository<Product> productRepository, [Service] IMapper mapper, int productId, int userAccountId)
        {
            var productFromRepo = await productRepository.GetProducts(userAccountId, productId);

            if (productFromRepo == null || productFromRepo?.Count == 0)
            {
                return new ProductNotExistsError(productId);
            }

            var productResult = mapper.Map<ProductInformationResult>(productFromRepo?[0]);

            return productResult;
        }

        [Authorize]
        public async Task<IProductPayload> CheckProductCode([Service] IProductRepository<Product> productRepository, int productId, string productCode)
        {
            var productFromRepo = await productRepository.GetProductByUniqueCode(productId, productCode);
            return new CheckProductCodeInformationResult(productFromRepo != null);
        }
    }
}
