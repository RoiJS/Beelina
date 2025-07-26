import { NgModule } from '@angular/core';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';

/**
 * Returns a mapping of IndexedDB version numbers to migration functions for updating the database schema.
 *
 * Each migration function performs schema changes such as creating or deleting object stores and indexes to support new features or data structures as the database version increases.
 *
 * @returns An object where each key is a database version number and each value is a function that applies the necessary schema changes for that version.
 */
export function migrationFactory() {
  // The animal table was added with version 2 but none of the existing tables or data needed
  // to be modified so a migrator for that version is not included.
  return {
    2: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('customers');

      // Create the new index with the desired name
      store.createIndex('paymentMethodId', 'paymentMethodId', { unique: false });

      // Delete the old index
      store.deleteIndex('paymentMethod');
    },
    3: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('customerUsers');

      // Create the new index with the desired name
      store.createIndex('user_and_customer', ['userId', 'customer'], { unique: false });
    },
    4: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('customerUsers');

      // Create the new index with the desired name
      store.deleteIndex('user_and_customer');
    },
    5: (db: IDBDatabase, transaction: IDBTransaction) => {
      // Create a new object store named 'userSettings'
      const userSettingsStore = db.createObjectStore('userSettings', {
        keyPath: 'id', autoIncrement: true
      });

      // Define the schema for the 'userSettings' object store
      userSettingsStore.createIndex('customerName', 'customerName', { unique: false });
    },
    6: (db: IDBDatabase, transaction: IDBTransaction) => {
      // Create a new object store named 'userSettings'
      const store = transaction.objectStore('userSettings');

      // Define the schema for the 'userSettings' object store
      store.deleteIndex('customerName');
      store.createIndex('allowOrderConfirmation', 'allowOrderConfirmation', { unique: false });
      store.createIndex('allowOrderPayments', 'allowOrderPayments', { unique: false });
      store.createIndex('allowSendReceipt', 'allowSendReceipt', { unique: false });
      store.createIndex('allowAutoSendReceipt', 'allowAutoSendReceipt', { unique: false });
    },
    7: (db: IDBDatabase, transaction: IDBTransaction) => {
      // Create a new object store named 'paymentMethods'
      const paymentMethodsStore = db.createObjectStore('paymentMethods', {
        keyPath: 'id', autoIncrement: true
      });

      // Define the schema for the 'paymentMethods' object store
      paymentMethodsStore.createIndex('name', 'name', { unique: false });
    },
    8: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('paymentMethods');

      // Define the schema for the 'paymentMethods' object store
      store.createIndex('customerUserId', 'customerUserId', { unique: false });
      store.createIndex('paymentMethodId', 'paymentMethodId', { unique: false });
    },
    9: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('productTransactions');

      // Define the schema for the 'paymentMethods' object store
      store.createIndex('transactionId', 'transactionId', { unique: false });
    },
    10: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('transactions');

      // Define the schema for the 'paymentMethods' object store
      store.deleteIndex('discount');
      store.createIndex('discount', 'discount', { unique: false });
    },
    11: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('transactions');

      // Define the schema for the 'paymentMethods' object store
      store.createIndex('createdById', 'createdById', { unique: false });
    },
    12: (db: IDBDatabase, transaction: IDBTransaction) => {
      const clientSubscription = db.createObjectStore('clientSubscription', {
        keyPath: 'id', autoIncrement: true
      });

      // Define the schema for the 'clientSubscription' object store
      clientSubscription.createIndex('clientId', 'clientId', { unique: false });
      clientSubscription.createIndex('subscriptionId', 'subscriptionId', { unique: false });
      clientSubscription.createIndex('subscriptionName', 'subscriptionName', { unique: false });
      clientSubscription.createIndex('subscriptionFeatureId', 'subscriptionFeatureId', { unique: false });
      clientSubscription.createIndex('startDate', 'startDate', { unique: false });
      clientSubscription.createIndex('endDate', 'endDate', { unique: false });
      clientSubscription.createIndex('offlineModeActive', 'offlineModeActive', { unique: false });
      clientSubscription.createIndex('productSkuMax', 'productSkuMax', { unique: false });
      clientSubscription.createIndex('topProductsPageActive', 'topProductsPageActive', { unique: false });
      clientSubscription.createIndex('customerAccountsMax', 'customerAccountsMax', { unique: false });
      clientSubscription.createIndex('customersMax', 'customersMax', { unique: false });
      clientSubscription.createIndex('dashboardDistributionPageActive', 'dashboardDistributionPageActive', { unique: false });
      clientSubscription.createIndex('orderPrintActive', 'orderPrintActive', { unique: false });
      clientSubscription.createIndex('sendReportEmailActive', 'sendReportEmailActive', { unique: false });
      clientSubscription.createIndex('userAccountsMax', 'userAccountsMax', { unique: false });
      clientSubscription.createIndex('registerUserAddOnActive', 'registerUserAddOnActive', { unique: false });
      clientSubscription.createIndex('customReportAddOnActive', 'customReportAddOnActive', { unique: false });
      clientSubscription.createIndex('currentSubscriptionPrice', 'currentSubscriptionPrice', { unique: false });
      clientSubscription.createIndex('currentRegisterUserAddonPrice', 'currentRegisterUserAddonPrice', { unique: false });
      clientSubscription.createIndex('currentCustomReportAddonPrice', 'currentCustomReportAddonPrice', { unique: false });

      const subscriptionFeatureHideDashboardWidget = db.createObjectStore('subscriptionFeatureHideDashboardWidgets', {
        keyPath: 'id', autoIncrement: true
      });

      subscriptionFeatureHideDashboardWidget.createIndex('subscriptionFeatureId', 'subscriptionFeatureId', { unique: false });
      subscriptionFeatureHideDashboardWidget.createIndex('dashboardModuleWidgetId', 'dashboardModuleWidgetId', { unique: false });

      const subscriptionFeatureAvailableReport = db.createObjectStore('subscriptionFeatureAvailableReports', {
        keyPath: 'id', autoIncrement: true
      });

      subscriptionFeatureAvailableReport.createIndex('subscriptionFeatureId', 'subscriptionFeatureId', { unique: false });
      subscriptionFeatureAvailableReport.createIndex('reportId', 'reportId', { unique: false });
    },
    13: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('clientSubscription');

      // Define the schema for the 'paymentMethods' object store
      store.deleteIndex('productSKUMax');
      store.createIndex('productSKUMax', 'productSKUMax', { unique: false });
    },
    14: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('clientSubscription');

      // Define the schema for the 'paymentMethods' object store
      store.deleteIndex('productSkuMax');
      store.createIndex('productSKUMax', 'productSKUMax', { unique: false });
    },
    15: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('clientSubscription');

      // Define the schema for the 'allowExceedUserAccountsMax' object store
      store.createIndex('allowExceedUserAccountsMax', 'allowExceedUserAccountsMax', { unique: false });
    },
    16: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('userSettings');

      store.createIndex('allowPrintReceipt', 'allowPrintReceipt', { unique: false });
      store.createIndex('autoPrintReceipt', 'autoPrintReceipt', { unique: false });
    },
    17: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('userSettings');

      store.createIndex('sendReceiptEmailAddress', 'sendReceiptEmailAddress', { unique: false });
    },
    18: (db: IDBDatabase, transaction: IDBTransaction) => {
      const store = transaction.objectStore('userSettings');

      store.createIndex('printReceiptFontSize', 'printReceiptFontSize', { unique: false });
    }
  };
}

const dbConfig: DBConfig = {
  name: 'bizualLocalDb',
  version: 18,
  objectStoresMeta: [
    {
      store: 'customerUsers',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'customer', keypath: 'customer', options: { unique: false } },
        { name: 'userId', keypath: 'userId', options: { unique: false } },
        { name: 'lastDateUpdated', keypath: 'lastDateUpdated', options: { unique: false } },
      ]
    },
    {
      store: 'products',
      storeConfig: { keyPath: 'id', autoIncrement: true, },
      storeSchema: [
        { name: 'customerUserId', keypath: 'customerUserId', options: { unique: false } },
        { name: 'productId', keypath: 'productId', options: { unique: true } },
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'code', keypath: 'code', options: { unique: false } },
        { name: 'description', keypath: 'description', options: { unique: false } },
        { name: 'supplierId', keypath: 'supplierId', options: { unique: false } },
        { name: 'stockQuantity', keypath: 'stockQuantity', options: { unique: false } },
        { name: 'pricePerUnit', keypath: 'pricePerUnit', options: { unique: false } },
        { name: 'price', keypath: 'price', options: { unique: false } },
        { name: 'isTransferable', keypath: 'isTransferable', options: { unique: false } },
        { name: 'numberOfUnits', keypath: 'numberOfUnits', options: { unique: false } },
        { name: 'productUnitId', keypath: 'productUnitId', options: { unique: false } },
      ]
    },
    {
      store: 'productUnits',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'customerUserId', keypath: 'customerUserId', options: { unique: false } },
        { name: 'productUnitId', keypath: 'productUnitId', options: { unique: true } },
        { name: 'name', keypath: 'name', options: { unique: false } },
      ]
    },
    {
      store: 'transactions',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'customerUserId', keypath: 'customerUserId', options: { unique: false } },
        { name: 'invoiceNo', keypath: 'invoiceNo', options: { unique: false } },
        { name: 'discount', keypath: 'discount', options: { unique: true } },
        { name: 'storeId', keypath: 'storeId', options: { unique: false } },
        { name: 'status', keypath: 'status', options: { unique: false } },
        { name: 'modeOfPayment', keypath: 'modeOfPayment', options: { unique: false } },
        { name: 'paid', keypath: 'paid', options: { unique: false } },
        { name: 'transactionDate', keypath: 'transactionDate', options: { unique: false } },
        { name: 'dueDate', keypath: 'dueDate', options: { unique: false } },
      ]
    },
    {
      store: 'productTransactions',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'customerUserId', keypath: 'customerUserId', options: { unique: false } },
        { name: 'code', keypath: 'code', options: { unique: false } },
        { name: 'productId', keypath: 'productId', options: { unique: false } },
        { name: 'productName', keypath: 'productName', options: { unique: false } },
        { name: 'price', keypath: 'price', options: { unique: false } },
        { name: 'quantity', keypath: 'quantity', options: { unique: false } },
        { name: 'currentQuantity', keypath: 'currentQuantity', options: { unique: false } },
      ]
    },
    {
      store: 'customerAccounts',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'customerUserId', keypath: 'customerUserId', options: { unique: false } },
        { name: 'barangayId', keypath: 'barangayId', options: { unique: false } },
        { name: 'name', keypath: 'name', options: { unique: false } },
      ]
    },
    {
      store: 'customers',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'customerUserId', keypath: 'customerUserId', options: { unique: false } },
        { name: 'customerId', keypath: 'customerId', options: { unique: false } },
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'address', keypath: 'address', options: { unique: false } },
        { name: 'emailAddress', keypath: 'emailAddress', options: { unique: false } },
        { name: 'outletType', keypath: 'outletType', options: { unique: false } },
        { name: 'paymentMethod', keypath: 'paymentMethod', options: { unique: false } },
        { name: 'barangayId', keypath: 'barangayId', options: { unique: false } },
      ]
    }
  ],
  migrationFactory
};

@NgModule({
  imports: [
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  exports: [NgxIndexedDBModule]
})
export class NgxIndexedDbModule { }
