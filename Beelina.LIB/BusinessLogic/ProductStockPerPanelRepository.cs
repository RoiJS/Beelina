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
    }
}
