using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;

namespace Beelina.LIB.Interfaces
{
    public interface IProductStockPerPanelRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        /// <summary>
/// Updates the specified product stock per panel entity and returns the updated instance.
/// </summary>
/// <param name="productStockPerPanel">The product stock per panel entity to update.</param>
/// <returns>The updated <see cref="ProductStockPerPanel"/> entity.</returns>
Task<ProductStockPerPanel> UpdateProductStockPerPanel(ProductStockPerPanel productStockPerPanel);
        /// <summary>
/// Retrieves the product stock information for a specific product and user account.
/// </summary>
/// <param name="productId">The unique identifier of the product.</param>
/// <param name="userAccountId">The unique identifier of the user account.</param>
/// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ProductStockPerPanel"/> for the specified product and user account.</returns>
Task<ProductStockPerPanel> GetProductStockPerPanel(int productId, int userAccountId);
        /// <summary>
            /// Retrieves a list of deleted product assignment items for a specified user account.
            /// </summary>
            /// <param name="userAccountId">The identifier of the user account.</param>
            /// <param name="deletedProductAssignmentProductIds">A list of product IDs corresponding to deleted product assignments.</param>
            /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
            /// <returns>A task that represents the asynchronous operation. The task result contains a list of <see cref="ProductStockPerPanel"/> objects representing the deleted product assignments.</returns>
            Task<List<ProductStockPerPanel>> GetDeletedProductAssignmentsItems(
            int userAccountId,
            List<int> deletedProductAssignmentProductIds,
            CancellationToken cancellationToken = default);
        /// <summary>
/// Retrieves all ProductStockPerPanel entities associated with the specified user account.
/// </summary>
/// <param name="userAccountId">The unique identifier of the user account.</param>
/// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
/// <returns>A task that represents the asynchronous operation. The task result contains a list of ProductStockPerPanel entities linked to the user account.</returns>
Task<List<ProductStockPerPanel>> GetProductStockPerPanelsByUserAccountId(int userAccountId, CancellationToken cancellationToken = default);
    }
}
