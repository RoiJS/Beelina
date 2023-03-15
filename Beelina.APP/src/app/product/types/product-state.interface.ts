import {
  IBaseState,
  IBaseStateConnection,
} from 'src/app/payment-methods/types/payment-method-state.interface';
import { Product } from 'src/app/_models/product';

export interface IProductState extends IBaseState, IBaseStateConnection {
  products: Array<Product>;
}
