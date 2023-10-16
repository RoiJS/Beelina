import { IBaseError } from '../errors/ibase.error';
import { IBarangayPayload } from '../payloads/ibarangay.payload';

export interface IBarangayOutput {
  barangay: IBarangayPayload;
  errors: Array<IBaseError>;
}
