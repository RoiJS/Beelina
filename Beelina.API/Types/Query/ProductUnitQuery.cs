using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class ProductUnitQuery
    {
        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        public async Task<IList<ProductUnit>> GetProductUnits([Service] IProductUnitRepository<ProductUnit> productUnitRepository)
        {
            return await productUnitRepository.GetAllEntities().ToListObjectAsync();
        }
    }
}