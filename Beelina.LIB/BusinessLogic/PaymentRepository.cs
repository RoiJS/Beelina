using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Beelina.LIB.BusinessLogic
{
    public class PaymentRepository(IBeelinaRepository<Payment> beelinaRepository, IOptions<ApplicationSettings> appSettings)
                : BaseRepository<Payment>(beelinaRepository, beelinaRepository.ClientDbContext), IPaymentRepository<Payment>
    {
        private readonly IOptions<ApplicationSettings> _appSettings = appSettings;

        public async Task<List<PaymentDetails>> GetPaymentsByTransaction(int transactionId)
        {
            var payments = await _beelinaRepository.ClientDbContext.Payments
                            .Where(t => t.TransactionId == transactionId)
                            .Select(t => new PaymentDetails
                            {
                                Id = t.Id,
                                TransactionId = t.TransactionId,
                                Amount = t.Amount,
                                Notes = t.Notes,
                                PaymentDate = t.PaymentDate.ConvertToTimeZone(_appSettings.Value.GeneralSettings.TimeZone)
                            })
                            .ToListAsync();

            return payments;
        }

        public async Task RegisterPayment(Payment payment)
        {
            await AddEntity(payment);
        }
    }
}