import {
  IBaseState,
  IBaseStateConnection,
} from 'src/app/payment-methods/types/payment-method-state.interface';
import { ProductUnit } from 'src/app/_models/product-unit';

export interface IProductUnitState extends IBaseState, IBaseStateConnection {
  productUnits: Array<ProductUnit>;
}
