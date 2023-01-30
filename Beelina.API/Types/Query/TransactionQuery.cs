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
    }
}
