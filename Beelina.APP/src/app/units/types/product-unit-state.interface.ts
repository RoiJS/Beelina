import { IBaseState, IBaseStateConnection } from 'src/app/payment-methods/types/payment-method-state.interface';
import { ProductUnit } from 'src/app/_services/product-unit.service';

export interface IProductUnitState extends IBaseState, IBaseStateConnection {
  productUnits: Array<ProductUnit>;
}
