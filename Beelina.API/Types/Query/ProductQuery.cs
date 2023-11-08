﻿using AutoMapper;
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
        public async Task<IList<Product>> GetProducts([Service] IProductRepository<Product> productRepository, [Service] ICurrentUserService currentUserService)
        {
            return await productRepository.GetProducts(currentUserService.CurrentUserId, 0);
        }

        [Authorize]
        public async Task<IProductPayload> GetProduct([Service] IProductRepository<Product> productRepository, [Service] IMapper mapper, [Service] ICurrentUserService currentUserService, int productId)
        {
            var productFromRepo = await productRepository.GetProducts(currentUserService.CurrentUserId, productId);

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
