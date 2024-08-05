using System.Linq.Expressions;
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
            await transactionRepository.SaveChanges();
            return transactionFromRepo;
        }

        [Authorize]
        public async Task<List<Transaction>> MarkTransactionsAsPaid(
            [Service] ITransactionRepository<Transaction> transactionRepository,
            List<int> transactionIds,
            bool paid)
        {
            var transactionsFromRepo = await transactionRepository.MarkTransactionsAsPaid(transactionIds, paid);
            return transactionsFromRepo;
        }

        [Authorize]
        public async Task<bool> DeleteTransactions(
                [Service] ITransactionRepository<Transaction> transactionRepository,
                [Service] ICurrentUserService currentUserService,
                [Service] IHttpContextAccessor httpContextAccessor,
                List<int> transactionIds)
        {
            var result = true;

            try
            {
                transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);
                await transactionRepository.DeleteOrderTransactions(transactionIds);

                await transactionRepository.SaveChanges(httpContextAccessor.HttpContext.RequestAborted);
            }
            catch (Exception ex)
            {
                result = false;
                Console.Write($"Error deleting order transaction(s): {ex.Message}");
            }

            return result;
        }

        [Authorize]
        public async Task<bool> SetTransactionsStatus(
                [Service] ITransactionRepository<Transaction> transactionRepository,
                [Service] ICurrentUserService currentUserService,
                [Service] IHttpContextAccessor httpContextAccessor,
                List<int> transactionIds,
                TransactionStatusEnum status)
        {
            var result = true;

            try
            {
                transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);
                await transactionRepository.SetTransactionsStatus(transactionIds, status);

                await transactionRepository.SaveChanges(httpContextAccessor.HttpContext.RequestAborted);
            }
            catch (Exception ex)
            {
                result = false;
                Console.Write($"Error setting order transaction(s) status: {ex.Message}");
            }

            return result;
        }

        [Authorize]
        public async Task<bool> DeleteTransactionsByDate(
                [Service] ITransactionRepository<Transaction> transactionRepository,
                [Service] ICurrentUserService currentUserService,
                [Service] IHttpContextAccessor httpContextAccessor,
                TransactionStatusEnum transactionStatus,
                List<string> transactionDates)
        {
            var result = true;
            try
            {
                transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);

                foreach (var transactionDate in transactionDates)
                {
                    var transactionsByDateFromRepo = await transactionRepository.GetTransactionsByDate(transactionStatus, transactionDate);
                    await transactionRepository.DeleteOrderTransactions(transactionsByDateFromRepo.Select(t => t.Id).ToList());
                }

                await transactionRepository.SaveChanges(httpContextAccessor.HttpContext.RequestAborted);
            }
            catch (Exception ex)
            {
                result = false;
                Console.Write($"Error deleting order transaction(s): {ex.Message}");
            }

            return result;
        }
    }
}