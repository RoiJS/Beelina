import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  FilePickerAdapter,
  UploadResponse,
  UploadStatus,
  FilePreviewModel,
} from 'ngx-awesome-uploader';
import { ProductService } from '../_services/product.service';
import { IMapExtractedProductPayload } from '../_interfaces/payloads/imap-product-import.payload';
import { IFailedExtractedProductPayload } from '../_interfaces/payloads/ifailed-product-import.payload';

export class WarehouseFilePickerAdapter extends FilePickerAdapter {
  private _warehouseId: number = 1;

  constructor(private productService: ProductService) {
    super();
  }
  public uploadFile(
    fileItem: FilePreviewModel
  ): Observable<UploadResponse | undefined> {
    const file = <File>fileItem.file;
    return this.productService.extractProductsFile(this._warehouseId, file).pipe(
      map((data: {
        successExtractedProducts: Array<IMapExtractedProductPayload>,
        failedExtractedProducts: Array<IFailedExtractedProductPayload>
      }) => {
        return {
          body: data,
          status: UploadStatus.UPLOADED,
        };
      })
    );
  }

  public removeFile(fileItem: FilePreviewModel): Observable<any> {
    throw new Error("Not implemented!");
  }
}
