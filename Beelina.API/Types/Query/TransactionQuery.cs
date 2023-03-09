using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class TransactionQuery
    {
        [Authorize]
        [UsePaging]
        [UseProjection]
        public async Task<IList<Transaction>> GetTransactions([Service] ITransactionRepository<Transaction> transactionRepository)
        {
            return await transactionRepository.GetAllEntities().ToListObjectAsync();
        }

        [Authorize]
        public async Task<IList<TransactionHistoryDate>> GetTransactionDates([Service] ITransactionRepository<Transaction> transactionRepository, string transactionDate)
        {
            return await transactionRepository.GetTransactonDates(transactionDate);
        }

        [Authorize]
        public async Task<IList<Transaction>> GetTransactionsByDate([Service] ITransactionRepository<Transaction> transactionRepository, string transactionDate)
        {
            return await transactionRepository.GetTransactionByDate(transactionDate);
        }

        [Authorize]
        public async Task<Transaction> GetTransaction(
            [Service] ITransactionRepository<Transaction> transactionRepository,
            [Service] IProductTransactionRepository<ProductTransaction> productTransactionRepository,
            int transactionId)
        {
            var transactionFromRepo = await transactionRepository
                            .GetEntity(transactionId)
                            .Includes(t => t.Store)
                            .ToObjectAsync();

            transactionFromRepo.ProductTransactions = await productTransactionRepository.GetProductTransactions(transactionId);

            return transactionFromRepo;
        }
    }
}
