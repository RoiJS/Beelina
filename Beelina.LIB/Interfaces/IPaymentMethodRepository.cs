using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IPaymentMethodRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<PaymentMethod> GetPaymentMethodByName(string name);
    }
}
