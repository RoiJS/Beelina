using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
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
                                    .Where((p) => p.ProductId == productId && p.UserAccountId == userAccountId)
                                    .FirstOrDefaultAsync();

            return productStockPerPanelFromRepo;
        }

    }
}
