using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.AspNetCore.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class PaymentMethodQuery
    {
        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        public async Task<IList<PaymentMethod>> GetPaymentMethods([Service] IPaymentMethodRepository<PaymentMethod> paymentMethodRepository)
        {
            return await paymentMethodRepository.GetAllEntities().ToListObjectAsync();
        }
    }
}