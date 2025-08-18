import { IProductInformationQueryPayload } from 'src/app/_interfaces/payloads/iproduct-information-query.payload';
import { ProductUnit } from '../product-unit';

export class ProductInformationResult
  implements IProductInformationQueryPayload {
  public typename: string;
  public id: number;
  public name: string;
  public code: string;
  public description: string;
  public supplierId: number;
  public defaultPrice: number;
  public stocksRemainingFromWarehouse: number;
  public stockQuantity: number;
  public pricePerUnit: number;
  public price: number;
  public isTransferable: boolean;
  public numberOfUnits: number;
  public productUnit: ProductUnit;
  public validFrom?: Date;
  public validTo?: Date;
  public parent?: boolean;
  public productParentGroupId?: number;
}
