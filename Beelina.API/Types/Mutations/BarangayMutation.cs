using AutoMapper;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Exceptions;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class BarangayMutation
    {
        [Authorize]
        public async Task<Barangay> UpdateBarangay([Service] IBarangayRepository<Barangay> barangayRepository, [Service] IMapper mapper, BarangayInput barangayInput)
        {
            var brangayFromRepo = await barangayRepository.GetEntity(barangayInput.Id).ToObjectAsync();

            if (brangayFromRepo is null)
            {
                var newBarangay = new Barangay { Id = barangayInput.Id, Name = barangayInput.Name };
                await barangayRepository.AddEntity(newBarangay);
                return newBarangay;
            }
            else
            {
                mapper.Map(barangayInput, brangayFromRepo);
                await barangayRepository.SaveChanges();
                return brangayFromRepo;
            }
        }

        [Authorize]
        [Error(typeof(BarangayErrorFactory))]
        public async Task<Barangay> DeleteBarangay([Service] IBarangayRepository<Barangay> barangayRepository, [Service] ICurrentUserService currentUserService, int barangayId)
        {
            var barangayFromRepo = await barangayRepository.GetEntity(barangayId).ToObjectAsync();

            barangayRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            if (barangayFromRepo is null)
                throw new BarangayNotExistsException(barangayId);

            barangayRepository.DeleteEntity(barangayFromRepo);
            await barangayRepository.SaveChanges();

            return barangayFromRepo;
        }
    }
}