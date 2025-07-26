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
            [Service] ILogger<PaymentMutation> logger,
            [Service] IPaymentRepository<Payment> paymentRepository,
            [Service] ICurrentUserService currentUserService,
            PaymentInput paymentInput)
        {
            try
            {
                paymentRepository.SetCurrentUserId(currentUserService.CurrentUserId);

                var dateOnly = DateTime.Parse(paymentInput.PaymentDate).Date;
                var currentUtcTime = DateTime.UtcNow.TimeOfDay;
                var paymentDateTime = dateOnly.Add(currentUtcTime);

                var payment = new Payment
                {
                    TransactionId = paymentInput.TransactionId,
                    Notes = paymentInput.Notes,
                    Amount = paymentInput.Amount,
                    // PaymentDate = Convert.ToDateTime(paymentInput.PaymentDate)
                    //     .AddHours(DateTime.UtcNow.Hour)
                    //     .AddMinutes(DateTime.UtcNow.Minute)
                    //     .AddSeconds(DateTime.UtcNow.Second)

                    PaymentDate = paymentDateTime
                };

                await paymentRepository.RegisterPayment(payment);

                logger.LogInformation("Successfully register payment. Params {@params}", paymentInput);

                return payment;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to register payment. Params {@params}", paymentInput);

                throw new Exception($"Failed to register payment. {ex.Message}");
            }
        }
    }
}