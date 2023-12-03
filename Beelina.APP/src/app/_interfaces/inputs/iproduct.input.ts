import { IProductUnitInput } from './iproduct-unit.input';

export interface IProductInput {
  id: number;
  name: string;
  code: string;
  description: string;
  stockQuantity: number;
  pricePerUnit: number;
  withdrawalSlipNo: string;
  productUnitInput: IProductUnitInput;
}
