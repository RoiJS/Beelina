export enum StockAuditSourceEnum {
  None = 'NONE',
  FromWithdrawal = 'FROM_WITHDRAWAL',
  MovedFromOtherProductInventory = 'MOVED_FROM_OTHER_PRODUCT_INVENTORY',
  MovedToOtherProductInventory = 'MOVED_TO_OTHER_PRODUCT_INVENTORY',
  OrderTransaction = 'ORDER_TRANSACTION',
  OrderFromSupplier = 'ORDER_FROM_SUPPLIER',
  ResetProductStock = 'RESET_PRODUCT_STOCK',
}
