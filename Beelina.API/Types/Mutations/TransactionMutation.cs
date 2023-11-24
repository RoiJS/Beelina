using AutoMapper;
using Beelina.LIB.Enums;
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
            [Service] IProductRepository<Product> productRepository,
            [Service] IProductStockPerPanelRepository<ProductStockPerPanel> productStockPerPanelRepository,
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

            // Quantities will only be deducted on the inventory if the transaction has been confirmed.
            if (transactionInput.Status == TransactionStatusEnum.Confirmed)
            {
                foreach (var productTransaction in transactionInput.ProductTransactionInputs)
                {
                    var productStockPerPanelFromRepo = await productStockPerPanelRepository.GetProductStockPerPanel(productTransaction.ProductId, currentUserService.CurrentUserId);

                    if (productStockPerPanelFromRepo != null)
                    {
                        if (productTransaction.DiffQuantity != 0)
                        {
                            productStockPerPanelFromRepo.StockQuantity += productTransaction.DiffQuantity;
                            await productStockPerPanelRepository.SaveChanges();
                        }
                    }
                }

                foreach (var deletedProductTransaction in deletedProductTransactions)
                {
                    var productStockPerPanelFromRepo = await productStockPerPanelRepository.GetProductStockPerPanel(deletedProductTransaction.ProductId, currentUserService.CurrentUserId);

                    if (productStockPerPanelFromRepo != null)
                    {
                        productStockPerPanelFromRepo.StockQuantity += deletedProductTransaction.Quantity;
                        await productStockPerPanelRepository.SaveChanges();
                    }
                }
            }


            return transactionFromRepo;
        }

        [Authorize]
        public async Task<Transaction> MarkTransactionAsPaid(
            [Service] ITransactionRepository<Transaction> transactionRepository,
            [Service] ICurrentUserService currentUserService,
            int transactionId)
        {
            var transactionFromRepo = await transactionRepository.GetEntity(transactionId).Includes(t => t.ProductTransactions).ToObjectAsync();

            transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            transactionFromRepo.ProductTransactions.ForEach(p => p.Status = LIB.Enums.PaymentStatusEnum.Paid);

            await transactionRepository.SaveChanges();

            return transactionFromRepo;
        }

        [Authorize]
        public async Task<Transaction> DeleteTransaction(
                [Service] ITransactionRepository<Transaction> transactionRepository,
                [Service] ICurrentUserService currentUserService,
                int transactionId)
        {
            var transactionFromRepo = await transactionRepository.GetEntity(transactionId).ToObjectAsync();

            transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);
            transactionRepository.DeleteEntity(transactionFromRepo);
            await transactionRepository.SaveChanges();

            return transactionFromRepo;
        }
    }
}