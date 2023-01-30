using AutoMapper;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class ProductMutation
    {
        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<Product> RegisterProduct(
            [Service] IProductRepository<Product> productRepository,
            [Service] IProductUnitRepository<ProductUnit> productUnitRepository,
            [Service] IMapper mapper,
            ProductInput productInput)
        {
            var productUnitFromRepo = await productUnitRepository.GetProductUnitByName(productInput.ProductUnitInput.Name);

            // Create new product unit if not exists.
            if (productUnitFromRepo == null)
            {
                productUnitFromRepo = new ProductUnit
                {
                    Name = productInput.ProductUnitInput.Name
                };

                await productUnitRepository.AddEntity(productUnitFromRepo);
            }

            var productToCreate = mapper.Map<Product>(productInput);
            productToCreate.ProductUnitId = productUnitFromRepo.Id;

            await productRepository.RegisterProduct(productToCreate);

            return productToCreate;
        }
    }
}
