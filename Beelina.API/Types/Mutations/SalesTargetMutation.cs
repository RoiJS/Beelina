using AutoMapper;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class SalesTargetMutation
    {
        [Authorize]
        public async Task<SalesTarget> UpdateSalesTarget(
            [Service] ILogger<SalesTargetMutation> logger,
            [Service] ISalesTargetRepository<SalesTarget> salesTargetRepository,
            [Service] IMapper mapper,
            [Service] ICurrentUserService currentUserService,
            SalesTargetInput salesTargetInput)
        {
            try
            {
                salesTargetRepository.SetCurrentUserId(currentUserService.CurrentUserId);

                // Check for overlapping sales targets
                var hasOverlap = await salesTargetRepository.HasActiveSalesTarget(
                    salesTargetInput.SalesAgentId,
                    Convert.ToDateTime(salesTargetInput.StartDate),
                    Convert.ToDateTime(salesTargetInput.EndDate),
                    salesTargetInput.Id);

                if (hasOverlap)
                {
                    throw new Exception("A sales target already exists for this sales agent in the specified period.");
                }

                var salesTargetFromRepo = await salesTargetRepository.GetEntity(salesTargetInput.Id).ToObjectAsync();

                if (salesTargetFromRepo is null)
                {
                    var newSalesTarget = new SalesTarget
                    {
                        Id = salesTargetInput.Id,
                        SalesAgentId = salesTargetInput.SalesAgentId,
                        TargetAmount = salesTargetInput.TargetAmount,
                        PeriodType = salesTargetInput.PeriodType,
                        StartDate = Convert.ToDateTime(salesTargetInput.StartDate),
                        EndDate = Convert.ToDateTime(salesTargetInput.EndDate),
                        Description = salesTargetInput.Description
                    };
                    await salesTargetRepository.AddEntity(newSalesTarget);

                    logger.LogInformation("Successfully added new sales target. Params: {@params}", new
                    {
                        salesTargetInput
                    });

                    return newSalesTarget;
                }
                else
                {
                    mapper.Map(salesTargetInput, salesTargetFromRepo);
                    await salesTargetRepository.SaveChanges();

                    logger.LogInformation("Successfully updated sales target. Params: {@params}", new
                    {
                        salesTargetInput
                    });

                    return salesTargetFromRepo;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while updating sales target. Params: {@params}", new
                {
                    salesTargetInput
                });

                throw;
            }
        }


        [Authorize]
        public async Task<bool> DeleteSalesTargets(
            [Service] ILogger<SalesTargetMutation> logger,
            [Service] ISalesTargetRepository<SalesTarget> salesTargetRepository,
            [Service] ICurrentUserService currentUserService,
            List<int> salesTargetIds)
        {
            try
            {
                salesTargetRepository.SetCurrentUserId(currentUserService.CurrentUserId);
                await salesTargetRepository.DeleteSalesTargets(salesTargetIds);
                await salesTargetRepository.SaveChanges();

                logger.LogInformation("Successfully deleted sales targets. Params: {@params}", new
                {
                    salesTargetIds
                });

                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while deleting sales targets. Params: {@params}", new
                {
                    salesTargetIds
                });

                throw;
            }
        }
    }
}