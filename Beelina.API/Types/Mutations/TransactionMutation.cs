using AutoMapper;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class TransactionMutation
    {
        [Authorize]
        public async Task<Transaction> UpdateModeOfPayment(
            [Service] ITransactionRepository<Transaction> transactionRepository,
            [Service] ICurrentUserService currentUserService,
            int transactionId,
            int modeOfPayment)
        {
            var transactionFromRepo = await transactionRepository.GetEntity(transactionId).Includes(t => t.ProductTransactions).ToObjectAsync();

            transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            transactionFromRepo.ModeOfPayment = modeOfPayment;
            transactionFromRepo.ProductTransactions.ForEach(t =>
           {
               t.Status = (modeOfPayment == (int)ModeOfPaymentEnum.AccountReceivable) ? PaymentStatusEnum.Unpaid : PaymentStatusEnum.Paid;
           });

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

        [Authorize]
        public async Task<List<TransactionInformation>> DeleteTransactionsByDate(
                [Service] ITransactionRepository<Transaction> transactionRepository,
                [Service] ICurrentUserService currentUserService,
                TransactionStatusEnum transactionStatus,
                string transactionDate)
        {
            var transactionsByDateFromRepo = await transactionRepository.GetTransactionsByDate(transactionStatus, transactionDate);
            transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);
            await transactionRepository.DeleteOrderTransactions(transactionsByDateFromRepo.Select(t => t.Id).ToList());
            await transactionRepository.SaveChanges();

            return transactionsByDateFromRepo;
        }
    }
}