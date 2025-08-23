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
            [Service] ILogger<SupplierMutation> logger,
            [Service] ISupplierRepository<Supplier> supplierRepository,
            [Service] IMapper mapper,
            [Service] ICurrentUserService currentUserService,
            SupplierInput supplierInput)
        {
            try
            {
                supplierRepository.SetCurrentUserId(currentUserService.CurrentUserId);
                var supplierFromRepo = await supplierRepository.GetEntity(supplierInput.Id).ToObjectAsync();

                if (supplierFromRepo is null)
                {
                    var newSupplier = new Supplier { Id = supplierInput.Id, Name = supplierInput.Name, Code = supplierInput.Code };
                    await supplierRepository.AddEntity(newSupplier);

                    logger.LogInformation("Successfully added new supplier. Params: {@params}", new
                    {
                        supplierInput
                    });

                    return newSupplier;
                }
                else
                {
                    mapper.Map(supplierInput, supplierFromRepo);
                    await supplierRepository.SaveChanges();

                    logger.LogInformation("Successfully updated supplier. Params: {@params}", new
                    {
                        supplierInput
                    });

                    return supplierFromRepo;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update supplier information. Params: {@params}", new
                {
                    supplierInput
                });

                throw new Exception($"Failed to update supplier information. {ex.Message}");
            }

        }

        [Authorize]
        [Error(typeof(SupplierErrorFactory))]
        public async Task<bool> DeleteSuppliers(
            [Service] ILogger<SupplierMutation> logger,
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

                await supplierRepository.SaveChanges(httpContextAccessor?.HttpContext?.RequestAborted ?? default);

                logger.LogInformation("Successfully deleted suppliers. Params: {@params}", new
                {
                    supplierIds
                });
            }
            catch (Exception ex)
            {
                result = false;

                logger.LogError(ex, "Failed to delete suppliers. Params: {@params}", new
                {
                    supplierIds
                });
            }

            return result;
        }
    }
}