using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;

namespace Beelina.LIB.Interfaces
{
    public interface IProductWithdrawalEntryRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<ProductWithdrawalEntryResult> GetProductWithdrawalEntry(int productWithdrawalEntryId, CancellationToken cancellationToken = default);
        Task<List<ProductWithdrawalEntry>> GetProductWithdarawalEntries(ProductWithdrawalFilter productWithdrawalEntryFilter, string filterKeyword = "", CancellationToken cancellationToken = default);
        Task<ProductWithdrawalEntry> GetProductWithdrawalByUniqueCode(int productWithdrawalId, string withdrawalSlipNo);
        Task<string> GetLastProductWithdrawalCode(CancellationToken cancellationToken = default);
    }
}
