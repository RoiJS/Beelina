using Beelina.LIB.Enums;
using Beelina.LIB.Helpers;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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
