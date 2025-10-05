import { IProductUnitInput } from './iproduct-unit.input';

export interface IProductInput {
  id: number;
  name: string;
  code: string;
  description: string;
  supplierId: number;
  stockQuantity: number;
  pricePerUnit: number;
  costPrice: number;
  withdrawalSlipNo: string;
  plateNo: string;
  isTransferable: boolean;
  numberOfUnits: number;
  productUnitInput: IProductUnitInput;
  validFrom?: Date;
  validTo?: Date;
  parent?: boolean;
  productParentGroupId?: number;
}
