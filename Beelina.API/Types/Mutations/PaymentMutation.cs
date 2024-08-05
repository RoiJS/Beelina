using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using HotChocolate.Authorization;

namespace Beelina.API.Types.Mutations
{
    [ExtendObjectType("Mutation")]
    public class PaymentMutation
    {
        [Authorize]
        public async Task<Payment> RegisterPayment(
                [Service] IPaymentRepository<Payment> paymentRepository,
                [Service] ICurrentUserService currentUserService,
                PaymentInput paymentInput)
        {
            paymentRepository.SetCurrentUserId(currentUserService.CurrentUserId);

            var payment = new Payment { 
                TransactionId = paymentInput.TransactionId, 
                Notes = paymentInput.Notes, 
                Amount = paymentInput.Amount,
                PaymentDate = Convert.ToDateTime(paymentInput.PaymentDate)
                    .AddHours(DateTime.Now.Hour)
                    .AddMinutes(DateTime.Now.Minute)
                    .AddSeconds(DateTime.Now.Second)
            };

            await paymentRepository.RegisterPayment(payment);
            return payment;
        }
    }
}