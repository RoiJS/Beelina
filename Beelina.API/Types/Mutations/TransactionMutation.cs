using AutoMapper;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class TransactionMutation
    {

        [Authorize]
        public async Task<Transaction> RegisterTransaction(
            [Service] ITransactionRepository<Transaction> transactionRepository,
            [Service] IProductTransactionRepository<ProductTransaction> productTransactionRepository,
            [Service] IProductRepository<Product> productRepository,
            [Service] ICurrentUserService currentUserService,
            [Service] IMapper mapper,
            TransactionInput transactionInput)
        {

            transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);
            productRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            var transactionFromRepo = await transactionRepository
                                    .GetEntity(transactionInput.Id)
                                    .Includes(t => t.ProductTransactions)
                                    .ToObjectAsync();

            if (transactionFromRepo == null)
            {
                transactionFromRepo = mapper.Map<Transaction>(transactionInput);
            }
            else
            {
                mapper.Map(transactionInput, transactionFromRepo);
            }

            var deletedProductTransactions = transactionFromRepo.ProductTransactions.Where(t => transactionInput.ProductTransactionInputs.All(p => p.Id != t.Id)).ToList();

            transactionFromRepo.ProductTransactions = mapper.Map<List<ProductTransaction>>(transactionInput.ProductTransactionInputs);

            await transactionRepository.RegisterTransaction(transactionFromRepo);

            foreach (var productTransaction in transactionInput.ProductTransactionInputs)
            {
                var productFromRepo = await productRepository.GetEntity(productTransaction.ProductId).ToObjectAsync();

                if (productFromRepo != null)
                {
                    if (productTransaction.DiffQuantity != 0)
                    {
                        productFromRepo.StockQuantity += productTransaction.DiffQuantity;
                        await productRepository.SaveChanges();
                    }
                }
            }

            foreach (var deletedProductTransaction in deletedProductTransactions)
            {
                var productFromRepo = await productRepository.GetEntity(deletedProductTransaction.ProductId).ToObjectAsync();

                if (productFromRepo != null)
                {
                    productFromRepo.StockQuantity += deletedProductTransaction.Quantity;
                    await productRepository.SaveChanges();
                }
            }

            return transactionFromRepo;
        }
    }
}