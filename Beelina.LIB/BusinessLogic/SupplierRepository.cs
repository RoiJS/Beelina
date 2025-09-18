using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Beelina.LIB.Enums;
using Microsoft.EntityFrameworkCore;

namespace Beelina.LIB.BusinessLogic
{
    public class SupplierRepository(IBeelinaRepository<Supplier> beelinaRepository)
                : BaseRepository<Supplier>(beelinaRepository, beelinaRepository.ClientDbContext), ISupplierRepository<Supplier>
    {
        public async Task<List<Supplier>> GetSuppliers(string filterKeyword = "")
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

        public async Task<Supplier> GetSupplierByUniqueCode(int supplierId, string supplierCode)
        {
            var supplierFromRepo = await _beelinaRepository
                                      .ClientDbContext
                                      .Suppliers
                                      .Where((p) =>
                                          p.Id != supplierId &&
                                          p.Code == supplierCode &&
                                          p.IsActive &&
                                          !p.IsDelete
                                      ).FirstOrDefaultAsync();
            return supplierFromRepo;
        }

        public async Task<List<TopSupplierBySales>> GetTopSuppliersBySales(string fromDate, string toDate)
        {
            var query = _beelinaRepository.ClientDbContext.ProductTransactions
                .Include(pt => pt.Product)
                .ThenInclude(p => p.Supplier)
                .Include(pt => pt.Transaction)
                .Where(pt => pt.Transaction.Status == TransactionStatusEnum.Confirmed &&
                           pt.Product.IsActive && !pt.Product.IsDelete &&
                           pt.Product.Supplier.IsActive && !pt.Product.Supplier.IsDelete);

            // Apply date filters only if both dates are provided
            if (!string.IsNullOrEmpty(fromDate) && !string.IsNullOrEmpty(toDate))
            {
                var fromDateTime = DateTime.Parse(fromDate);
                var toDateTime = DateTime.Parse(toDate);
                query = query.Where(pt => pt.Transaction.TransactionDate >= fromDateTime &&
                                        pt.Transaction.TransactionDate <= toDateTime);
            }

            var topSuppliers = await query
                .GroupBy(pt => new
                {
                    SupplierId = pt.Product.SupplierId,
                    SupplierName = pt.Product.Supplier.Name,
                    SupplierCode = pt.Product.Supplier.Code
                })
                .Select(g => new TopSupplierBySales
                {
                    SupplierId = g.Key.SupplierId,
                    SupplierName = g.Key.SupplierName,
                    SupplierCode = g.Key.SupplierCode,
                    TotalSalesAmount = g.Sum(pt => (pt.Quantity * pt.Price) - ((pt.Transaction.Discount / 100) * (pt.Quantity * pt.Price))),
                    TotalProductsSold = g.Sum(pt => pt.Quantity),
                    TotalTransactions = g.Select(pt => pt.TransactionId).Distinct().Count()
                })
                .ToListAsync();

            return topSuppliers;
        }
    }
}