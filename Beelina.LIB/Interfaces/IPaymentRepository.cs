using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IPaymentRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<List<PaymentDetails>> GetPaymentsByTransaction(int transactionId);

        Task RegisterPayment(Payment payment);
    }
}