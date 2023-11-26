using AutoMapper;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Exceptions;
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
        public async Task<Product> UpdateProduct(
            [Service] IProductRepository<Product> productRepository,
            [Service] IMapper mapper,
            int userAccountId,
            ProductInput productInput)
        {
            var productFromRepo = await productRepository.GetEntity(productInput.Id).ToObjectAsync();

            if (productFromRepo == null)
            {
                productFromRepo = mapper.Map<Product>(productInput);
            }
            else
            {
                mapper.Map(productInput, productFromRepo);
            }

            try
            {
                await productRepository.CreateOrUpdateProduct(userAccountId, productInput, productFromRepo);
            }
            catch
            {
                throw new ProductFailedRegisterException(productFromRepo.Name);
            }

            return productFromRepo;
        }

        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<Product> DeleteProduct(
            [Service] IProductRepository<Product> productRepository,
            [Service] ICurrentUserService currentUserService,
            int productId)
        {
            var productFromRepo = await productRepository.GetEntity(productId).ToObjectAsync();

            productRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            if (productFromRepo == null)
                throw new ProductNotExistsException(productId);

            productRepository.DeleteEntity(productFromRepo);
            await productRepository.SaveChanges();

            return productFromRepo;
        }
    }
}
