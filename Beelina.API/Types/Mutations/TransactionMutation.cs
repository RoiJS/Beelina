using System.Linq.Expressions;
using AutoMapper;
using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Exceptions;
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
            [Service] ILogger<TransactionMutation> logger,
            [Service] ITransactionRepository<Transaction> transactionRepository,
            [Service] ICurrentUserService currentUserService,
            int transactionId,
            int modeOfPayment)
        {
            try
            {
                var transactionFromRepo = await transactionRepository
                                                        .GetEntity(transactionId)
                                                        .Includes(t => t.ProductTransactions)
                                                        .ToObjectAsync();

                transactionRepository.SetCurrentUserId(currentUserService.CurrentUserId);

                transactionFromRepo.ModeOfPayment = modeOfPayment;
                await transactionRepository.SaveChanges();

                logger.LogInformation("Mode of payment successfully updated. Params: {@params}", new
                {
                    transactionId,
                    modeOfPayment
                });

                return transactionFromRepo;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update mode of payment. Params: {@params}", new
                {
                    transactionId,
                    modeOfPayment
                });

                throw new Exception($"Failed to update mode of payment. {ex.Message}");
            }
        }

        [Authorize]
        public async Task<List<Transaction>> MarkTransactionsAsPaid(
            [Service] ILogger<TransactionMutation> logger,
            [Service] ITransactionRepository<Transaction> transactionRepository,
            List<int> transactionIds,
            bool paid)
        {
            try
            {
                var transactionsFromRepo = await transactionRepository.MarkTransactionsAsPaid(transactionIds, paid);

                logger.LogInformation("Successfully Set transaction status. Params: {@params}", new
                {
                    transactionIds,
                    paid
                });

                return transactionsFromRepo;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to set transaction status. Params: {@params}", new
                {
                    transactionIds,
                    paid
                });

                throw new Exception($"Failed to set transaction status. {ex.Message}");
            }
        }

        [Authorize]
        public async Task<bool> DeleteTransactions(
            [Service] ILogger<TransactionMutation> logger,
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

                logger.LogInformation("Successfully delete transactions. Params: {@params}", new
                {
                    transactionIds
                });
            }
            catch (Exception ex)
            {
                result = false;

                logger.LogError(ex, "Failed to delete transactions. Params: {@params}", new
                {
                    transactionIds
                });
            }

            return result;
        }

        [Authorize]
        public async Task<bool> SetTransactionsStatus(
            [Service] ILogger<TransactionMutation> logger,
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

                logger.LogInformation("Successfully set transactions status . Params: {@params}", new
                {
                    transactionIds,
                    status
                });
            }
            catch (Exception ex)
            {
                result = false;

                logger.LogError(ex, "Failed to set transactions status. Params: {@params}", new
                {
                    transactionIds,
                    status
                });
            }

            return result;
        }

        [Authorize]
        public async Task<bool> DeleteTransactionsByDate(
            [Service] ILogger<TransactionMutation> logger,
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

                logger.LogInformation("Successfully deleted transactions by date. Params: {@params}", new
                {
                    transactionDates
                });
            }
            catch (Exception ex)
            {
                result = false;

                logger.LogError(ex, "Failed to delete transactions by date. Params: {@params}", new
                {
                    transactionDates
                });

                throw new Exception($"Failed to delete transactions by date. {ex.Message}");
            }

            return result;
        }

        [Authorize]
        public async Task<bool> SendInvoiceTransaction(
            [Service] ILogger<TransactionMutation> logger,
            [Service] ITransactionRepository<Transaction> transactionRepository,
            int userId,
            int transactionId,
            IFile file)
        {

            try
            {
                var result = await transactionRepository.SendInvoiceTransaction(userId, transactionId, file);

                if (result)
                {
                    logger.LogInformation("Successfully send invoice transaction. Params {@params}", new
                    {
                        transactionId,
                        file
                    });
                }
                else
                {
                    logger.LogError("Failed to send invoice transaction. Params {@params}", new
                    {
                        transactionId,
                        file
                    });
                }

                return result;

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send invoice transaction. Params {@params}", new
                {
                    transactionId,
                    file
                });

                return false;
            }
        }
    }
}