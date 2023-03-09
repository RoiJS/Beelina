import { IProductInformationQueryPayload } from 'src/app/_interfaces/payloads/iproduct-information-query.payload';
import { ProductUnit } from 'src/app/_services/product-unit.service';

export class ProductInformationResult
  implements IProductInformationQueryPayload
{
  public typename: string;
  public id: number;
  public name: string;
  public code: string;
  public description: string;
  public stockQuantity: number;
  public pricePerUnit: number;
  public price: number;
  public productUnit: ProductUnit;
}
