using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IPaymentRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<List<Payment>> GetPaymentsByTransaction(int transactionId);

        Task RegisterPayment(Payment payment);
    }
}