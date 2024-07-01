using Beelina.LIB.GraphQL.Results;
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

        [Authorize]
        public async Task<IList<Supplier>> GetAllSuppliers([Service] ISupplierRepository<Supplier> supplierRepository)
        {
            return await supplierRepository.GetSuppliers();
        }

        [Authorize]
        public async Task<ISupplierPayload> CheckSupplierCode([Service] ISupplierRepository<Supplier> supplierRepository, int supplierId, string supplierCode)
        {
            var supplierFromRepo = await supplierRepository.GetSupplierByUniqueCode(supplierId, supplierCode);
            return new CheckSupplierCodeInformationResult(supplierFromRepo != null);
        }
    }
}