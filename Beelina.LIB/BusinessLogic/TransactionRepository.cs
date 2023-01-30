using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;

namespace Beelina.LIB.BusinessLogic
{
    public class TransactionRepository
        : BaseRepository<Transaction>, ITransactionRepository<Transaction>
    {

        public TransactionRepository(IBeelinaRepository<Transaction> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }

        public async Task<Transaction> RegisterTransaction(Transaction transaction)
        {
            await AddEntity(transaction);

            return transaction;
        }
    }
}
