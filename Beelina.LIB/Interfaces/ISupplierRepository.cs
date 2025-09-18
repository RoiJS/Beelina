using Beelina.LIB.Models;

namespace Beelina.LIB.Interfaces
{
    public interface ISupplierRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<List<Supplier>> GetSuppliers(string filterKeyword = "");

        Task DeleteSuppliers(List<int> supplierIds);

        Task<Supplier> GetSupplierByUniqueCode(int supplierId, string supplierCode);

        Task<List<TopSupplierBySales>> GetTopSuppliersBySales(string fromDate = "", string toDate = "");
    }
}