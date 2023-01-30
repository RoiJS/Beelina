using Beelina.LIB.Enums;
using Beelina.LIB.Helpers;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography.X509Certificates;

namespace Beelina.LIB.BusinessLogic
{
    public class ProductUnitRepository
        : BaseRepository<ProductUnit>, IProductUnitRepository<ProductUnit>
    {
        public ProductUnitRepository(
                IBeelinaRepository<ProductUnit> beelinaRepository
            )
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {

        }

        public async Task<ProductUnit> GetProductUnitByName(string name)
        {
            var productUnit = await _beelinaRepository.ClientDbContext.ProductUnits.Where(pu => pu.Name == name).FirstOrDefaultAsync();
            return productUnit;
        }
    }
}
