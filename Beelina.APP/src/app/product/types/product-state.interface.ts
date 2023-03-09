import {
  IBaseState,
  IBaseStateConnection,
} from 'src/app/payment-methods/types/payment-method-state.interface';
import { Product } from 'src/app/_services/product.service';

export interface IProductState extends IBaseState, IBaseStateConnection {
  products: Array<Product>;
}
