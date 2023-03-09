using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class PaymentMethodRepository
        : BaseRepository<PaymentMethod>, IPaymentMethodRepository<PaymentMethod>
    {
        public PaymentMethodRepository(IBeelinaRepository<PaymentMethod> beelinaRepository)
            : base(beelinaRepository, beelinaRepository.ClientDbContext)
        {
        }

        public async Task<PaymentMethod> GetPaymentMethodByName(string name)
        {
            var paymentMethod = await _beelinaRepository.ClientDbContext.PaymentMethods.Where(p => p.Name == name).FirstOrDefaultAsync();
            return paymentMethod;
        }
    }
}
