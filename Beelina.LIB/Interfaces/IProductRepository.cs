﻿using Beelina.LIB.Enums;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Models;
using Beelina.LIB.Models.Filters;

namespace Beelina.LIB.Interfaces
{
    public interface IProductRepository<TEntity>
        : IBaseRepository<TEntity> where TEntity : class, IEntity
    {
        Task<IList<Product>> GetProducts(int userId, int productId, string filterKeyWord = "", ProductsFilter productsFilter = null, CancellationToken cancellationToken = default);
        Task<IList<Product>> GetWarehouseProducts(int warehouseId, int productId, string filterKeyWord = "", ProductsFilter productsFilter = null, CancellationToken cancellationToken = default, List<FilteredProduct> filteredProducts = null);
        Task<Product> UpdateProduct(Product product);
        Task<Product> GetProductByUniqueCode(int productId, string productCode);
        Task<Product> GetProductByCode(string productCode);
        Task<List<Product>> CreateOrUpdatePanelProducts(int userAccountId, int warehouseId, List<ProductInput> productInputs, CancellationToken cancellationToken = default);
        Task<List<Product>> CreateOrUpdateWarehouseProducts(int warehouseId, List<ProductInput> productInputs, CancellationToken cancellationToken = default);
        Task<List<ProductStockAuditItem>> GetProductStockAuditItems(int productId, int userAccountId, StockAuditSourceEnum stockAuditSource, string fromDate, string toDate, CancellationToken cancellationToken = default);
        Task<List<ProductStockAuditItem>> GetWarehouseProductStockAuditItems(int productId, int warehouseId, StockAuditSourceEnum stockAuditSource, string fromDate, string toDate);
        Task<List<Product>> GetProductsDetailList(int userId, string filterKeyWord = "");
        Task<ProductStockPerWarehouse> ManageProductStockPerWarehouse(Product product, ProductInput productInput, int warehouseId, CancellationToken cancellationToken);
        Task<ProductStockPerPanel> ManageProductStockPerPanel(Product product, ProductInput productInput, int userAccountId, CancellationToken cancellationToken);
        Task<Product> TransferProductStockFromOwnInventory(
            int userAccountId,
            int warehouseId,
            int sourceProductId,
            int destinationProductId,
            int destinationProductNumberOfUnits,
            int sourceProductNumberOfUnits,
            int sourceNumberOfUnitsTransfered,
            TransferProductStockTypeEnum transferProductStockType,
            CancellationToken cancellationToken);

        Task<Product> TransferWarehouseProductStockFromOwnInventory(
            int userAccountId,
            int warehouseId,
            int sourceProductId,
            int destinationProductId,
            int destinationProductNumberOfUnits,
            int sourceProductNumberOfUnits,
            int sourceNumberOfUnitsTransfered,
            TransferProductStockTypeEnum transferProductStockType,
            CancellationToken cancellationToken);

        Task<MapExtractedProductResult> MapProductImport(ExtractProductResult productImportResult, IList<Product> warehouseProductsFromRepo);
        Task<IEnumerable<Product>> GetProductPriceAssignments(
            int userAccountId,
            string filterKeyWord = "",
            ProductsFilter productsFilter = null,
            CancellationToken cancellationToken = default);

        Task<List<ProductStockPerPanel>> UpdateProductPriceAssignments(
            int userAccountId,
            List<ProductStockPerPanelInput> updateProductAssignments,
            List<int> deletedProductAssignments,
            CancellationToken cancellationToken = default);
            
        Task<List<ProductStockPerPanel>> CopyProductPriceAssignments(
        int sourceUserAccountId,
        int destinationUserAccountId,
        CancellationToken cancellationToken = default);

        Task<string> GetLatestProductCode(CancellationToken cancellationToken = default);
        Task<string> GetLatestTransactionCode(int userAccountId, CancellationToken cancellationToken = default);
    }
}
