using Beelina.LIB.Enums;
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

        /// <summary>
            /// Transfers a specified number of product units from a source product to a destination product within a warehouse inventory.
            /// </summary>
            /// <param name="userAccountId">The ID of the user performing the transfer.</param>
            /// <param name="warehouseId">The ID of the warehouse where the transfer occurs.</param>
            /// <param name="sourceProductId">The ID of the product from which stock is transferred.</param>
            /// <param name="destinationProductId">The ID of the product to which stock is transferred.</param>
            /// <param name="destinationProductNumberOfUnits">The resulting number of units for the destination product after the transfer.</param>
            /// <param name="sourceProductNumberOfUnits">The resulting number of units for the source product after the transfer.</param>
            /// <param name="sourceNumberOfUnitsTransfered">The number of units to transfer from the source product.</param>
            /// <param name="transferProductStockType">The type of stock transfer operation.</param>
            /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
            /// <returns>The updated destination product after the stock transfer.</returns>
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

        /// <summary>
/// Maps imported product data to existing warehouse products and returns the mapping result.
/// </summary>
/// <param name="productImportResult">The result of the product import extraction process.</param>
/// <param name="warehouseProductsFromRepo">The list of existing products in the warehouse to map against.</param>
/// <returns>The result of mapping the imported products to warehouse products.</returns>
Task<MapExtractedProductResult> MapProductImport(ExtractProductResult productImportResult, IList<Product> warehouseProductsFromRepo);
        /// <summary>
            /// Retrieves product price assignments for a specified user account, optionally filtered by keyword and product filters.
            /// </summary>
            /// <param name="userAccountId">The ID of the user account for which to retrieve price assignments.</param>
            /// <param name="filterKeyWord">An optional keyword to filter the product price assignments.</param>
            /// <param name="productsFilter">Optional filters to further refine the product selection.</param>
            /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
            /// <returns>A collection of products with their price assignments matching the specified criteria.</returns>
            Task<IEnumerable<Product>> GetProductPriceAssignments(
            int userAccountId,
            string filterKeyWord = "",
            ProductsFilter productsFilter = null,
            CancellationToken cancellationToken = default);

        /// <summary>
            /// Updates product price assignments for a user account by applying the provided updates and deletions.
            /// </summary>
            /// <param name="userAccountId">The identifier of the user account whose product price assignments are being modified.</param>
            /// <param name="updateProductAssignments">A list of product price assignment updates to apply.</param>
            /// <param name="deletedProductAssignments">A list of product price assignment IDs to delete.</param>
            /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
            /// <returns>A list of updated product price assignments after the operation.</returns>
            Task<List<ProductStockPerPanel>> UpdateProductPriceAssignments(
            int userAccountId,
            List<ProductStockPerPanelInput> updateProductAssignments,
            List<int> deletedProductAssignments,
            CancellationToken cancellationToken = default);
            
        /// <summary>
        /// Copies product price assignments from the source user account to the destination user account.
        /// </summary>
        /// <param name="sourceUserAccountId">The ID of the user account from which to copy price assignments.</param>
        /// <param name="destinationUserAccountId">The ID of the user account to which price assignments will be copied.</param>
        /// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
        /// <returns>A list of product price assignments created or updated for the destination user account.</returns>
        Task<List<ProductStockPerPanel>> CopyProductPriceAssignments(
        int sourceUserAccountId,
        int destinationUserAccountId,
        CancellationToken cancellationToken = default);

        /// <summary>
/// Retrieves the latest product code available in the system.
/// </summary>
/// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
/// <returns>The most recent product code as a string.</returns>
Task<string> GetLatestProductCode(CancellationToken cancellationToken = default);
        /// <summary>
/// Retrieves the latest transaction code associated with the specified user account.
/// </summary>
/// <param name="userAccountId">The identifier of the user account.</param>
/// <param name="cancellationToken">Token to monitor for cancellation requests.</param>
/// <returns>The latest transaction code as a string.</returns>
Task<string> GetLatestTransactionCode(int userAccountId, CancellationToken cancellationToken = default);
    }
}
