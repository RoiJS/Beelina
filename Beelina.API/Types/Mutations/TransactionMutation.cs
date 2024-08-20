using System.Linq.Expressions;
using AutoMapper;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;
using Microsoft.Extensions.Options;
using ReserbizAPP.LIB.Helpers.Class;
using ReserbizAPP.LIB.Helpers.Services;

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
                Console.WriteLine($"Error deleting order transaction(s): {ex.Message}");
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
                Console.WriteLine($"Error deleting order transaction(s): {ex.Message}");
            }

            return result;
        }

        [Authorize]
        public async Task<bool> SendInvoiceTransaction(
            [Service] ITransactionRepository<Transaction> transactionRepository,
            int userId,
            int transactionId,
            IFile file)
        {
            try
            {
                return await transactionRepository.SendInvoiceTransaction(userId, transactionId, file);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending invoice receipt: {ex.Message}");
                return false;
            }
        }
    }
}