import { IProductWarehouseStockReceiptEntryPayload } from 'src/app/_interfaces/payloads/iproduct-warehouse-stock-receipt-entry-query.payload';

export class CheckPurchaseOrderCodeInformationResult
  implements IProductWarehouseStockReceiptEntryPayload {
  public typename: string;
  public exists: boolean;
}
