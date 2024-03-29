using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface IBarangayRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<Barangay> GetBarangayByName(string name, int userId);
        Task<List<Barangay>> GetBarangays(int currentUserId);
    }
}