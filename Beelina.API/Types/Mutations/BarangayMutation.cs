using AutoMapper;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Exceptions;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class BarangayMutation
    {
        [Authorize]
        public async Task<Barangay> UpdateBarangay(
            [Service] ILogger<BarangayMutation> logger,
            [Service] IBarangayRepository<Barangay> barangayRepository,
            [Service] IMapper mapper,
            [Service] ICurrentUserService currentUserService,
            BarangayInput barangayInput)
        {
            try
            {
                var barangayFromRepo = await barangayRepository.GetEntity(barangayInput.Id).ToObjectAsync();

                if (barangayFromRepo is null)
                {
                    var newBarangay = new Barangay { Id = barangayInput.Id, Name = barangayInput.Name, UserAccountId = currentUserService.CurrentUserId };
                    await barangayRepository.AddEntity(newBarangay);

                    logger.LogInformation("New barangay has been created! Params: {@params}", newBarangay);
                    return newBarangay;
                }
                else
                {
                    mapper.Map(barangayInput, barangayFromRepo);
                    await barangayRepository.SaveChanges();

                    logger.LogInformation("Barangay has been updated! Params: {@params}", barangayFromRepo);
                    return barangayFromRepo;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to manage barangay details! Params: {@params}", barangayInput);
                throw new Exception($"Failed to manage barangay details: {ex.Message}");
            }
        }

        [Authorize]
        [Error(typeof(BarangayErrorFactory))]
        public async Task<Barangay> DeleteBarangay(
            [Service] ILogger<BarangayMutation> logger,
            [Service] IBarangayRepository<Barangay> barangayRepository,
            [Service] ICurrentUserService currentUserService,
            int barangayId)
        {

            try
            {
                var barangayFromRepo = await barangayRepository.GetEntity(barangayId).ToObjectAsync();

                barangayRepository.SetCurrentUserId(currentUserService.CurrentUserId);

                if (barangayFromRepo is null)
                    throw new BarangayNotExistsException(barangayId);

                barangayRepository.DeleteEntity(barangayFromRepo);
                await barangayRepository.SaveChanges();

                logger.LogInformation("Successfully deleted barangay. Params {@params}", new
                {
                    barangayId
                });

                return barangayFromRepo;
            }
            catch (BarangayNotExistsException ex)
            {
                logger.LogError(ex, "Failed to delete barangay. Params {@params}", new
                {
                    barangayId
                });

                throw new BarangayNotExistsException(barangayId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete barangay. Params {@params}", new
                {
                    barangayId
                });

                throw new Exception($"Failed to delete barangay. ${ex.Message}");
            }

        }
    }
}