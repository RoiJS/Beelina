using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class SupplierQuery
    {
        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        [UseFiltering]
        public async Task<List<Supplier>> GetSuppliers([Service] ISupplierRepository<Supplier> supplierRepository, string filterKeyword = "")
        {
            return await supplierRepository.GetSuppliers(filterKeyword);
        }
    }
}