import { IBaseError } from '../errors/ibase.error';
import { IFailedExtractedProductPayload } from '../payloads/ifailed-product-import.payload';
import { IMapExtractedProductPayload } from '../payloads/imap-product-import.payload';

export interface IExtractedProductsFileOutput {
  data: {
    extractProductsFile: {
      mapExtractedProductResult: {
        successExtractedProducts: Array<IMapExtractedProductPayload>;
        failedExtractedProducts: Array<IFailedExtractedProductPayload>;
      }
      errors: Array<IBaseError>;
    }
  }
}
