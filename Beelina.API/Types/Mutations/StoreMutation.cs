using AutoMapper;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class StoreMutation
    {
        [Authorize]
        [Error(typeof(StoreErrorFactory))]
        public async Task<Store> RegisterStore(
            [Service] IPaymentMethodRepository<PaymentMethod> paymentMethodRepository,
            [Service] IStoreRepository<Store> storeRepository,
            [Service] IMapper mapper,
            StoreInput storeInput)
        {
            var paymentMethodFromRepo = await paymentMethodRepository.GetPaymentMethodByName(storeInput.PaymentMethodInput.Name);

            // Create new payment method if not exists.
            if (paymentMethodFromRepo == null)
            {
                paymentMethodFromRepo = new PaymentMethod
                {
                    Name = storeInput.PaymentMethodInput.Name
                };

                await paymentMethodRepository.AddEntity(paymentMethodFromRepo);
            }

            var storeToCreate = mapper.Map<Store>(storeInput);
            storeToCreate.PaymentMethod.Id = paymentMethodFromRepo.Id;

            await storeRepository.RegisterStore(storeToCreate);

            return storeToCreate;
        }
    }
}
