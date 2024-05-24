using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class SupplierRepository(IBeelinaRepository<Supplier> beelinaRepository)
                : BaseRepository<Supplier>(beelinaRepository, beelinaRepository.ClientDbContext), ISupplierRepository<Supplier>
    {
        public async Task<List<Supplier>> GetSuppliers(string filterKeyword)
        {
            var suppliers = await _beelinaRepository.ClientDbContext.Suppliers
                                .Where(s =>
                                    ((filterKeyword != "" && (s.Name.Contains(filterKeyword) || s.Code.Contains(filterKeyword))) || filterKeyword == "") &&
                                    !s.IsDelete &&
                                    s.IsActive
                                ).ToListAsync();
            return suppliers;
        }

        public async Task DeleteSuppliers(List<int> supplierIds)
        {
            var suppliersFromRepo = await _beelinaRepository.ClientDbContext.Suppliers
                                .Where(t => supplierIds.Contains(t.Id))
                                .ToListAsync();

            DeleteMultipleEntities(suppliersFromRepo);
        }
    }
}