using Beelina.LIB.DbContexts;
using Beelina.LIB.Enums;
using Beelina.LIB.Models;

namespace Beelina.UnitTest;

public class BeelinaBaseTest
{
    public UserAccount AdminAccount { get; set; } = new UserAccount
    {
        Id = 1,
        FirstName = "Admin",
        LastName = "User",
        IsActive = true,
        IsDelete = false,
        SalesAgentType = SalesAgentTypeEnum.None,
        UserPermissions =
        [
            new UserPermission { PermissionLevel = PermissionLevelEnum.Administrator, ModuleId = ModulesEnum.Distribution }
        ]
    };

    public UserAccount FieldAgent { get; set; } = new UserAccount
    {
        Id = 2,
        FirstName = "Field",
        LastName = "Agent",
        IsActive = true,
        IsDelete = false,
        SalesAgentType = SalesAgentTypeEnum.FieldAgent,
        UserPermissions =
        [
            new UserPermission { PermissionLevel = PermissionLevelEnum.User, ModuleId = ModulesEnum.Distribution }
        ]
    };

    public UserAccount WarehouseAgent { get; set; } = new UserAccount
    {
        Id = 3,
        FirstName = "Warehouse",
        LastName = "Agent",
        IsActive = true,
        IsDelete = false,
        SalesAgentType = SalesAgentTypeEnum.WarehouseAgent,
        UserPermissions =
        [
            new UserPermission { PermissionLevel = PermissionLevelEnum.User, ModuleId = ModulesEnum.Distribution }
        ]
    };

    public BeelinaBaseTest()
    {

    }

    public void SeedSampleData(BeelinaClientDataContext context, int currentUserId = 1)
    {
        ClearAllData(context);

        context.UserAccounts.Add(AdminAccount);
        context.UserAccounts.Add(FieldAgent);
        context.UserAccounts.Add(WarehouseAgent);
        context.SaveChanges();

        context.CurrentUserId = currentUserId;

        AddProductUnits(context);
        AddSuppliers(context);
        AddWarehouses(context);
        AddProductsAndPanels(context, currentUserId);
        AddProductWithdrawalsAndAudits(context, currentUserId);
        AddProductStockPerWarehouses(context);
        AddProductWarehouseStockReceiptEntries(context, currentUserId);
        AddBarangays(context, currentUserId);
        AddPaymentMethods(context);
        AddStores(context);
        AddTransactions(context, FieldAgent);
        AddProductTransactions(context);
        AddOtherUserTransactions(context, WarehouseAgent);
        AddOtherUserProductTransactions(context);
    }

    private void ClearAllData(BeelinaClientDataContext context)
    {
        // Clear child entities first due to foreign key constraints
        context.ProductTransactions.RemoveRange(context.ProductTransactions);
        context.ProductStockAudits.RemoveRange(context.ProductStockAudits);
        context.ProductStockWarehouseAudit.RemoveRange(context.ProductStockWarehouseAudit);
        context.ProductStockPerPanels.RemoveRange(context.ProductStockPerPanels);
        context.ProductStockPerWarehouse.RemoveRange(context.ProductStockPerWarehouse);
        context.UserPermission.RemoveRange(context.UserPermission);
        // Clear parent entities
        context.Transactions.RemoveRange(context.Transactions);
        context.Products.RemoveRange(context.Products);
        context.ProductWarehouseStockReceiptEntries.RemoveRange(context.ProductWarehouseStockReceiptEntries);
        context.ProductWithdrawalEntries.RemoveRange(context.ProductWithdrawalEntries);
        context.Stores.RemoveRange(context.Stores);
        context.UserAccounts.RemoveRange(context.UserAccounts);
        context.Barangays.RemoveRange(context.Barangays);
        context.PaymentMethods.RemoveRange(context.PaymentMethods);
        context.Warehouses.RemoveRange(context.Warehouses);
        context.Suppliers.RemoveRange(context.Suppliers);
        context.ProductUnits.RemoveRange(context.ProductUnits);
        context.GeneralSettings.RemoveRange(context.GeneralSettings);
        context.SaveChanges();
    }

    private void AddProductUnits(BeelinaClientDataContext context)
    {
        var productUnit = new ProductUnit { Id = 1, Name = "Unit" };
        context.ProductUnits.Add(productUnit);
        context.SaveChanges();
    }

    private void AddSuppliers(BeelinaClientDataContext context)
    {
        var supplier1 = new Supplier { Id = 1, Name = "Supplier 1" };
        var supplier2 = new Supplier { Id = 2, Name = "Supplier 2" };
        context.Suppliers.AddRange(supplier1, supplier2);
        context.SaveChanges();
    }

    private void AddWarehouses(BeelinaClientDataContext context)
    {
        var warehouses = new List<Warehouse>();
        for (int w = 1; w <= 2; w++)
        {
            warehouses.Add(new Warehouse { Id = w, Name = $"Warehouse {w}", Address = $"Address {w}" });
        }
        context.Warehouses.AddRange(warehouses);
        context.SaveChanges();
    }

    private void AddProductsAndPanels(
        BeelinaClientDataContext context,
        int currentUserId)
    {
        int productId = 1;
        int productStockPerPanelId = 100;
        var products = new List<Product>();
        var productStockPerPanels = new List<ProductStockPerPanel>();

        // Retrieve product unit and suppliers from the context
        var productUnit = context.ProductUnits.FirstOrDefault();
        if (productUnit == null)
            throw new InvalidOperationException("At least one product unit is required in the database.");

        var suppliers = context.Suppliers.OrderBy(s => s.Id).ToList();
        if (suppliers.Count < 2)
            throw new InvalidOperationException("At least two suppliers are required in the database.");

        for (int s = 0; s < 2; s++)
        {
            var supplier = suppliers[s];
            for (int i = 1; i <= 15; i++)
            {
                var product = new Product
                {
                    Id = productId,
                    Name = $"Product {i} - {supplier.Name}",
                    Code = $"P{productId:D3}",
                    IsActive = true,
                    IsDelete = false,
                    ProductUnitId = productUnit.Id,
                    SupplierId = supplier.Id
                };

                products.Add(product);
                context.Products.Add(product);

                var productStockPerPanel = new ProductStockPerPanel
                {
                    Id = productStockPerPanelId,
                    ProductId = productId,
                    UserAccountId = currentUserId,
                    PricePerUnit = 10 + productId, // Example price
                };

                productStockPerPanels.Add(productStockPerPanel);
                context.ProductStockPerPanels.Add(productStockPerPanel);

                productId++;
                productStockPerPanelId++;
            }
        }
        context.SaveChanges();
    }

    private void AddProductWithdrawalsAndAudits(BeelinaClientDataContext context, int currentUserId)
    {
        var withdrawalEntry = new ProductWithdrawalEntry
        {
            UserAccountId = currentUserId,
            StockEntryDate = DateTime.UtcNow,
            WithdrawalSlipNo = "WDE-001",
            Notes = "Initial withdrawal entry",
            ProductStockAudits = []
        };
        context.ProductWithdrawalEntries.Add(withdrawalEntry);

        // Retrieve ProductStockPerPanels from the context
        var productStockPerPanels = context.ProductStockPerPanels.ToList();

        foreach (var productStockPerPanel in productStockPerPanels)
        {
            for (int j = 1; j <= 5; j++)
            {
                withdrawalEntry.ProductStockAudits.Add(new ProductStockAudit
                {
                    ProductStockPerPanelId = productStockPerPanel.Id,
                    StockAuditSource = StockAuditSourceEnum.FromWithdrawal,
                    Quantity = 100,
                    DateCreated = DateTime.UtcNow.AddDays(-j),
                    CreatedById = currentUserId,
                });
            }
        }
        context.SaveChanges();
    }

    private void AddProductStockPerWarehouses(
        BeelinaClientDataContext context)
    {
        int warehouseStockId = 1;
        var productStockPerWarehouses = new List<ProductStockPerWarehouse>();

        // Retrieve warehouses and products from the context
        var warehouses = context.Warehouses.ToList();
        var products = context.Products.ToList();

        foreach (var warehouse in warehouses)
        {
            foreach (var product in products)
            {
                var stockPerWarehouse = new ProductStockPerWarehouse
                {
                    ProductId = product.Id,
                    WarehouseId = warehouse.Id,
                    PricePerUnit = 100 + warehouseStockId
                };

                productStockPerWarehouses.Add(stockPerWarehouse);
                context.ProductStockPerWarehouse.Add(stockPerWarehouse);

                warehouseStockId++;
            }
        }
        context.SaveChanges();
    }

    private void AddProductWarehouseStockReceiptEntries(
        BeelinaClientDataContext context,
        int currentUserId)
    {
        // Retrieve Supplier 1, Warehouses, and ProductStockPerWarehouses from the context
        var supplier1 = context.Suppliers.OrderBy(s => s.Id).FirstOrDefault();
        if (supplier1 == null)
            throw new InvalidOperationException("Supplier 1 is required in the database.");

        var warehouses = context.Warehouses.OrderBy(w => w.Id).ToList();
        if (warehouses.Count == 0)
            throw new InvalidOperationException("At least one warehouse is required in the database.");

        var productStockPerWarehouses = context.ProductStockPerWarehouse.ToList();
        if (productStockPerWarehouses.Count == 0)
            throw new InvalidOperationException("At least one ProductStockPerWarehouse is required in the database.");

        var productWarehouseStockEntry = new ProductWarehouseStockReceiptEntry
        {
            SupplierId = supplier1.Id,
            StockEntryDate = DateTime.UtcNow,
            ReferenceNo = "REF-001",
            PlateNo = "PLT-001",
            Notes = "Initial stock entry",
            WarehouseId = warehouses[0].Id,
            ProductStockWarehouseAudits = []
        };
        context.ProductWarehouseStockReceiptEntries.Add(productWarehouseStockEntry);

        foreach (var productStockPerWarehouse in productStockPerWarehouses)
        {
            for (int r = 1; r <= 3; r++)
            {
                productWarehouseStockEntry.ProductStockWarehouseAudits.Add(new ProductStockWarehouseAudit
                {
                    ProductStockPerWarehouseId = productStockPerWarehouse.Id,
                    Quantity = 50 * r, // Example quantity
                    StockAuditSource = StockAuditSourceEnum.OrderFromSupplier,
                    CreatedById = currentUserId,
                });
            }
        }
        context.SaveChanges();
    }

    private void AddBarangays(BeelinaClientDataContext context, int currentUserId)
    {
        var barangays = new List<Barangay>
        {
            new() { Id = 1, Name = "Barangay 1", UserAccountId = currentUserId },
            new() { Id = 2, Name = "Barangay 2", UserAccountId = currentUserId },
            new() { Id = 3, Name = "Barangay 3", UserAccountId = currentUserId }
        };
        context.Barangays.AddRange(barangays);
        context.SaveChanges();
    }

    private void AddPaymentMethods(BeelinaClientDataContext context)
    {
        var paymentMethods = new List<PaymentMethod>
        {
            new() { Id = 1, Name = "Cash" },
            new() { Id = 2, Name = "Credit Card" },
            new() { Id = 3, Name = "Bank Transfer" }
        };
        context.PaymentMethods.AddRange(paymentMethods);
        context.SaveChanges();
    }

    private void AddStores(BeelinaClientDataContext context)
    {
        // Retrieve barangays and payment methods from the context
        var barangays = context.Barangays.OrderBy(b => b.Id).ToList();
        var paymentMethods = context.PaymentMethods.OrderBy(pm => pm.Id).ToList();

        if (barangays.Count < 3)
            throw new InvalidOperationException("At least three barangays are required in the database.");
        if (paymentMethods.Count < 3)
            throw new InvalidOperationException("At least three payment methods are required in the database.");

        var stores = new List<Store>();
        for (int i = 1; i <= 3; i++)
        {
            stores.Add(new Store
            {
                Id = i,
                BarangayId = barangays[i - 1].Id,
                PaymentMethodId = paymentMethods[i - 1].Id,
                Name = $"Store{i}"
            });
        }
        context.Stores.AddRange(stores);
        context.SaveChanges();
    }

    private void AddTransactions(BeelinaClientDataContext context, UserAccount fieldAgent)
    {
        context.CurrentUserId = fieldAgent.Id;

        // Retrieve stores from the context
        var stores = context.Stores.OrderBy(s => s.Id).ToList();

        var transactions = new List<Transaction>();
        // 10 Confirmed transactions
        for (int i = 1; i <= 10; i++)
        {
            transactions.Add(new Transaction
            {
                Id = i,
                IsActive = true,
                IsDelete = false,
                Status = TransactionStatusEnum.Confirmed,
                CreatedById = fieldAgent.Id,
                TransactionDate = DateTime.UtcNow.AddDays(-i),
                StoreId = stores[(i - 1) % stores.Count].Id, // Assign store in round-robin
                Store = stores[(i - 1) % stores.Count],
                InvoiceNo = $"INV-{i:0000}",
                ModeOfPayment = (int)((i % 3 == 0) ? ModeOfPaymentEnum.Cheque : (i % 3 == 1) ? ModeOfPaymentEnum.Cash : ModeOfPaymentEnum.AccountReceivable)
            });
        }
        // 10 Draft transactions
        for (int i = 11; i <= 20; i++)
        {
            transactions.Add(new Transaction
            {
                Id = i,
                IsActive = true,
                IsDelete = false,
                Status = TransactionStatusEnum.Draft,
                CreatedById = fieldAgent.Id,
                TransactionDate = DateTime.UtcNow.AddDays(-i),
                StoreId = stores[(i - 1) % stores.Count].Id,
                Store = stores[(i - 1) % stores.Count],
                InvoiceNo = $"INV-{i:0000}",
                ModeOfPayment = (int)((i % 3 == 0) ? ModeOfPaymentEnum.Cheque : (i % 3 == 1) ? ModeOfPaymentEnum.Cash : ModeOfPaymentEnum.AccountReceivable)
            });
        }
        // 10 BadOrder transactions
        for (int i = 21; i <= 30; i++)
        {
            transactions.Add(new Transaction
            {
                Id = i,
                IsActive = true,
                IsDelete = false,
                Status = TransactionStatusEnum.BadOrder,
                CreatedById = fieldAgent.Id,
                TransactionDate = DateTime.UtcNow.AddDays(-i),
                StoreId = stores[(i - 1) % stores.Count].Id,
                Store = stores[(i - 1) % stores.Count],
                InvoiceNo = $"INV-{i:0000}",
                ModeOfPayment = (int)((i % 3 == 0) ? ModeOfPaymentEnum.Cheque : (i % 3 == 1) ? ModeOfPaymentEnum.Cash : ModeOfPaymentEnum.AccountReceivable)
            });
        }
        context.Transactions.AddRange(transactions);
        context.SaveChanges();
    }

    private void AddProductTransactions(
        BeelinaClientDataContext context)
    {

        // Retrieve products, productStockPerPanels, and transactions from the context
        var products = context.Products.OrderBy(p => p.Id).ToList();
        var productStockPerPanels = context.ProductStockPerPanels.ToList();
        var transactions = context.Transactions.OrderBy(t => t.Id).ToList();

        var productTransactions = new List<ProductTransaction>();
        // 10 for Confirmed, 10 for Draft, 10 for BadOrder
        for (int i = 1; i <= 30; i++)
        {
            var product = products[(i - 1) % 10];
            var price = productStockPerPanels
                .Where(psp => psp.ProductId == product.Id)
                .Select(psp => psp.PricePerUnit)
                .FirstOrDefault();

            productTransactions.Add(new ProductTransaction
            {
                Id = i,
                ProductId = ((i - 1) % 10) + 1, // Distribute among 10 products
                TransactionId = i,
                IsActive = true,
                IsDelete = false,
                Price = price,
                Quantity = i,
                Product = product,
                Transaction = transactions[i - 1]
            });
        }
        context.ProductTransactions.AddRange(productTransactions);
        context.SaveChanges();
    }

    private void AddOtherUserTransactions(
        BeelinaClientDataContext context,
        UserAccount warehouseAgent)
    {

        context.CurrentUserId = warehouseAgent.Id;

        // Retrieve stores from the context
        var stores = context.Stores.OrderBy(s => s.Id).ToList();

        var otherUserTransactions = new List<Transaction>();
        // 3 Confirmed, 3 Draft, 3 BadOrder for userId = 3
        for (int i = 31; i <= 33; i++)
        {
            otherUserTransactions.Add(new Transaction
            {
                Id = i,
                IsActive = true,
                IsDelete = false,
                Status = TransactionStatusEnum.BadOrder,
                CreatedById = warehouseAgent.Id,
                TransactionDate = DateTime.UtcNow.AddDays(-i),
                StoreId = stores[(i - 1) % stores.Count].Id,
                Store = stores[(i - 1) % stores.Count],
                InvoiceNo = $"INV-{i:0000}",
                ModeOfPayment = (int)((i % 3 == 0) ? ModeOfPaymentEnum.Cheque : (i % 3 == 1) ? ModeOfPaymentEnum.Cash : ModeOfPaymentEnum.AccountReceivable)
            });
        }
        for (int i = 34; i <= 36; i++)
        {
            otherUserTransactions.Add(new Transaction
            {
                Id = i,
                IsActive = true,
                IsDelete = false,
                Status = TransactionStatusEnum.Draft,
                CreatedById = warehouseAgent.Id,
                TransactionDate = DateTime.UtcNow.AddDays(-i),
                StoreId = stores[(i - 1) % stores.Count].Id,
                Store = stores[(i - 1) % stores.Count],
                InvoiceNo = $"INV-{i:0000}",
                ModeOfPayment = (int)((i % 3 == 0) ? ModeOfPaymentEnum.Cheque : (i % 3 == 1) ? ModeOfPaymentEnum.Cash : ModeOfPaymentEnum.AccountReceivable)
            });
        }
        for (int i = 37; i <= 39; i++)
        {
            otherUserTransactions.Add(new Transaction
            {
                Id = i,
                IsActive = true,
                IsDelete = false,
                Status = TransactionStatusEnum.Confirmed,
                CreatedById = warehouseAgent.Id,
                TransactionDate = DateTime.UtcNow.AddDays(-i),
                StoreId = stores[(i - 1) % stores.Count].Id,
                Store = stores[(i - 1) % stores.Count],
                InvoiceNo = $"INV-{i:0000}",
                ModeOfPayment = (int)((i % 3 == 0) ? ModeOfPaymentEnum.Cheque : (i % 3 == 1) ? ModeOfPaymentEnum.Cash : ModeOfPaymentEnum.AccountReceivable)
            });
        }
        context.Transactions.AddRange(otherUserTransactions);
        context.SaveChanges();
    }

    private void AddOtherUserProductTransactions(
        BeelinaClientDataContext context)
    {
        // Retrieve products, productStockPerPanels, and otherUserTransactions from the context
        var products = context.Products.OrderBy(p => p.Id).ToList();
        var productStockPerPanels = context.ProductStockPerPanels.ToList();
        var otherUserTransactions = context.Transactions
            .Where(t => t.CreatedById == WarehouseAgent.Id)
            .OrderBy(t => t.Id)
            .ToList();

        var otherUserProductTransactions = new List<ProductTransaction>();
        for (int i = 31; i <= 39; i++)
        {
            var product = products[(i - 1) % 10];
            var price = productStockPerPanels
                .Where(psp => psp.ProductId == product.Id)
                .Select(psp => psp.PricePerUnit)
                .FirstOrDefault();

            otherUserProductTransactions.Add(new ProductTransaction
            {
                Id = 30 + (i - 30),
                ProductId = ((i - 1) % 10) + 1,
                TransactionId = i,
                IsActive = true,
                IsDelete = false,
                Price = price,
                Quantity = i % 5 + 1,
                Product = product,
                Transaction = otherUserTransactions[i - 31]
            });
        }
        context.ProductTransactions.AddRange(otherUserProductTransactions);
        context.SaveChanges();
    }
}