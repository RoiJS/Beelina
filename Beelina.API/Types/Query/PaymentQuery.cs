using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Query
{
    [ExtendObjectType("Query")]
    public class PaymentQuery
    {
        [Authorize]
        [UsePaging(MaxPageSize = 100, DefaultPageSize = 100)]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<List<PaymentDetails>> GetPayments([Service] IPaymentRepository<Payment> paymentRepository, int transactionId)
        {
            return await paymentRepository.GetPaymentsByTransaction(transactionId);
        }
    }
}