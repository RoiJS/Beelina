﻿using AutoMapper;
using Beelina.LIB.GraphQL.Errors.Factories;
using Beelina.LIB.GraphQL.Exceptions;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class StoreMutation
    {
        [Authorize]
        [Error(typeof(StoreErrorFactory))]
        public async Task<Store> UpdateStore(
            [Service] IBarangayRepository<Barangay> barangayRepository,
            [Service] IPaymentMethodRepository<PaymentMethod> paymentMethodRepository,
            [Service] IStoreRepository<Store> storeRepository,
            [Service] IMapper mapper,
            [Service] ICurrentUserService currentUserService,
            StoreInput storeInput)
        {
            var storeFromRepo = await storeRepository.GetEntity(storeInput.Id).ToObjectAsync();
            var paymentMethodFromRepo = await paymentMethodRepository.GetPaymentMethodByName(storeInput.PaymentMethodInput.Name);
            var barangayFromRepo = await barangayRepository.GetBarangayByName(storeInput.BarangayInput.Name, currentUserService.CurrentUserId);

            storeRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            if (storeFromRepo == null)
            {
                storeFromRepo = mapper.Map<Store>(storeInput);
            }
            else
            {
                mapper.Map(storeInput, storeFromRepo);
            }

            // Create new payment method if not exists.
            if (paymentMethodFromRepo == null)
            {
                paymentMethodFromRepo = new PaymentMethod
                {
                    Name = storeInput.PaymentMethodInput.Name
                };

                await paymentMethodRepository.AddEntity(paymentMethodFromRepo);
            }

            // Create new barangay if not exists.
            if (barangayFromRepo == null)
            {
                barangayFromRepo = new Barangay
                {
                    Name = storeInput.BarangayInput.Name
                };

                await barangayRepository.AddEntity(barangayFromRepo);
            }

            storeFromRepo.PaymentMethodId = paymentMethodFromRepo.Id;
            storeFromRepo.BarangayId = barangayFromRepo.Id;

            await storeRepository.UpdateStore(storeFromRepo);

            return storeFromRepo;
        }

        [Authorize]
        [Error(typeof(StoreErrorFactory))]
        public async Task<Store> DeleteStore([Service] IStoreRepository<Store> storeRepository, [Service] ICurrentUserService currentUserService, int storeId)
        {
            var storeFromRepo = await storeRepository.GetEntity(storeId).ToObjectAsync();

            storeRepository.SetCurrentUserId(currentUserService.CurrentUserId);
            
            if (storeFromRepo == null)
                throw new StoreNotExistsException(storeId);

            storeRepository.DeleteEntity(storeFromRepo);
            await storeRepository.SaveChanges();

            return storeFromRepo;
        }
    }
}
