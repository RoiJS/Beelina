using AutoMapper;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class SupplierMutation
    {
        [Authorize]
        public async Task<Supplier> UpdateSupplier(
                [Service] ISupplierRepository<Supplier> supplierRepository,
                [Service] IMapper mapper,
                [Service] ICurrentUserService currentUserService,
                SupplierInput supplierInput)
        {
            supplierRepository.SetCurrentUserId(currentUserService.CurrentUserId);
            var supplierFromRepo = await supplierRepository.GetEntity(supplierInput.Id).ToObjectAsync();

            if (supplierFromRepo is null)
            {
                var newSupplier = new Supplier { Id = supplierInput.Id, Name = supplierInput.Name, Code = supplierInput.Code };
                await supplierRepository.AddEntity(newSupplier);
                return newSupplier;
            }
            else
            {
                mapper.Map(supplierInput, supplierFromRepo);
                await supplierRepository.SaveChanges();
                return supplierFromRepo;
            }
        }

        [Authorize]
        [Error(typeof(SupplierErrorFactory))]
        public async Task<bool> DeleteSuppliers(
            [Service] ISupplierRepository<Supplier> supplierRepository,
            [Service] ICurrentUserService currentUserService,
            [Service] IHttpContextAccessor httpContextAccessor,
            List<int> supplierIds)
        {
            var result = true;

            try
            {
                supplierRepository.SetCurrentUserId(currentUserService.CurrentUserId);
                await supplierRepository.DeleteSuppliers(supplierIds);

                await supplierRepository.SaveChanges(httpContextAccessor.HttpContext.RequestAborted);
            }
            catch (Exception ex)
            {
                result = false;
                Console.Write($"Error deleting supplier(s): {ex.Message}");
            }

            return result;
        }
    }
}