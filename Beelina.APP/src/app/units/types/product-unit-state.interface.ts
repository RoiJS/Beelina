import { IBaseStateConnection } from 'src/app/_interfaces/states/ibase-connection.state';
import { IBaseState } from 'src/app/_interfaces/states/ibase.state';
import { ProductUnit } from 'src/app/_models/product-unit';

export interface IProductUnitState extends IBaseState, IBaseStateConnection {
  productUnits: Array<ProductUnit>;
}
