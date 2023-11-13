using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IBarangayRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Barangay> GetBarangayByName(string name);
        Task<List<Barangay>> GetBarangays(int currentUserId);
    }
}