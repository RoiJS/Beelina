using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductStockPerPanelRepository
        : BaseRepository<ProductStockPerPanel>, IProductStockPerPanelRepository<ProductStockPerPanel>
    {

        public ProductStockPerPanelRepository(IBeelinaRepository<ProductStockPerPanel> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }


        public async Task<ProductStockPerPanel> UpdateProductStockPerPanel(ProductStockPerPanel productStockPerPanel)
        {
            if (productStockPerPanel.Id == 0)
                await AddEntity(productStockPerPanel);
            else
                await SaveChanges();

            return productStockPerPanel;
        }


        /// <summary>
        /// Retrieves the active and non-deleted ProductStockPerPanel entity for the specified product and user account.
        /// </summary>
        /// <param name="productId">The ID of the product.</param>
        /// <param name="userAccountId">The ID of the user account.</param>
        /// <returns>The matching ProductStockPerPanel entity, or null if not found.</returns>
        public async Task<ProductStockPerPanel> GetProductStockPerPanel(int productId, int userAccountId)
        {
            var productStockPerPanelFromRepo = await _beelinaRepository
                                    .ClientDbContext
                                    .ProductStockPerPanels
                                    .Where((p) =>
                                        p.ProductId == productId &&
                                        p.UserAccountId == userAccountId &&
                                        !p.IsDelete &&
                                        p.IsActive
                                    )
                                    .FirstOrDefaultAsync();

            return productStockPerPanelFromRepo;
        }

        /// <summary>
        /// Retrieves all <see cref="ProductStockPerPanel"/> entities for the specified user account and product IDs, including related product stock audits.
        /// </summary>
        /// <param name="userAccountId">The ID of the user account.</param>
        /// <param name="deletedProductAssignmentProductIds">A list of product IDs corresponding to deleted product assignments.</param>
        /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
        /// <returns>A list of <see cref="ProductStockPerPanel"/> entities matching the criteria, each with its related product stock audits.</returns>
        public async Task<List<ProductStockPerPanel>> GetDeletedProductAssignmentsItems(
            int userAccountId,
            List<int> deletedProductAssignmentProductIds,
            CancellationToken cancellationToken = default)
        {
            return await _beelinaRepository.ClientDbContext.ProductStockPerPanels
                .Where(p =>
                    deletedProductAssignmentProductIds.Contains(p.ProductId) &&
                    p.UserAccountId == userAccountId
                )
                .Include(p => p.ProductStockAudits)
                .ToListAsync(cancellationToken);
        }


        /// <summary>
        /// Retrieves all active and non-deleted ProductStockPerPanel entities associated with the specified user account.
        /// </summary>
        /// <param name="userAccountId">The ID of the user account to filter ProductStockPerPanel entities by.</param>
        /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
        /// <returns>A list of active and non-deleted ProductStockPerPanel entities for the given user account.</returns>
        public async Task<List<ProductStockPerPanel>> GetProductStockPerPanelsByUserAccountId(int userAccountId, CancellationToken cancellationToken = default)
        {
            return await _beelinaRepository.ClientDbContext.ProductStockPerPanels
                .Where(p => p.UserAccountId == userAccountId && p.IsActive && !p.IsDelete)
                .ToListAsync(cancellationToken);
        }
    }
}
