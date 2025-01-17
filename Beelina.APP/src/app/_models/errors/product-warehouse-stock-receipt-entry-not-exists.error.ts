import { IBaseError } from 'src/app/_interfaces/errors/ibase.error';
import { IProductWarehouseStockReceiptEntryPayload } from 'src/app/_interfaces/payloads/iproduct-warehouse-stock-receipt-entry-query.payload';

export class ProductWarehouseStockReceiptEntryNotExistsError
  implements IProductWarehouseStockReceiptEntryPayload, IBaseError {
  public typename: string;
  public code: string;
  public message: string;
}
