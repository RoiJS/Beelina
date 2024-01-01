using AutoMapper;
using Beelina.LIB.Enums;
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
        public async Task<List<Product>> UpdateProducts(
            [Service] IProductRepository<Product> productRepository,
            [Service] IMapper mapper,
            int userAccountId,
            List<ProductInput> productInputs)
        {
            var productsFromRepo = new List<Product>();

            foreach (var productInput in productInputs)
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
                    productsFromRepo.Add(productFromRepo);
                }
                catch
                {
                    throw new ProductFailedRegisterException(productFromRepo.Name);
                }
            }

            return productsFromRepo;
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

        [Authorize]
        [Error(typeof(ProductErrorFactory))]
        public async Task<ProductStockAudit> UpdateProductStockAudit(
            [Service] IProductRepository<Product> productRepository,
            int productStockAuditId,
            string withdrawalSlipNo,
            int newQuantity
        )
        {
            var productStockAuditFromRepo = await productRepository.GetProductStockAudit(productStockAuditId);

            if (productStockAuditFromRepo is null)
                throw new ProductStockAuditNotExistsException(productStockAuditId);

            productStockAuditFromRepo.WithdrawalSlipNo = withdrawalSlipNo;
            productStockAuditFromRepo.Quantity = newQuantity;
            await productRepository.SaveChanges();
            return productStockAuditFromRepo;
        }

        [Authorize]
        public async Task<Product> TransferProductStockFromOwnInventory(
                    [Service] IProductRepository<Product> productRepository,
                    int userAccountId,
                    int sourceProductId,
                    int destinationProductId,
                    int destinationProductNumberOfUnits,
                    int sourceProductNumberOfUnits,
                    int sourceNumberOfUnitsTransfered,
                    TransferProductStockTypeEnum transferProductStockType)
        {
            return await productRepository.TransferProductStockFromOwnInventory(
                userAccountId,
                sourceProductId,
                destinationProductId,
                destinationProductNumberOfUnits,
                sourceProductNumberOfUnits,
                sourceNumberOfUnitsTransfered,
                transferProductStockType
            );
        }
    }
}
