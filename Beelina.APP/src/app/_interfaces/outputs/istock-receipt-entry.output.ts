import { IBaseError } from '../errors/ibase.error';
import { IStockReceiptEntryPayload } from '../payloads/istock-receipt-entry.payload';

export interface IStockReceiptEntryOutput {
  productWarehouseStockReceiptEntry: IStockReceiptEntryPayload;
  errors: Array<IBaseError>;
}
