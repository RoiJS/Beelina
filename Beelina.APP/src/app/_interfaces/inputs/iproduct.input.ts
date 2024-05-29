import { IProductUnitInput } from './iproduct-unit.input';

export interface IProductInput {
  id: number;
  name: string;
  code: string;
  description: string;
  supplierId: number;
  stockQuantity: number;
  pricePerUnit: number;
  withdrawalSlipNo: string;
  isTransferable: boolean;
  numberOfUnits: number;
  productUnitInput: IProductUnitInput;
}
