import { IProductPayload } from 'src/app/_interfaces/payloads/iproduct.payload';
import { IBaseStateConnection } from 'src/app/_interfaces/states/ibase-connection.state';
import { IBaseState } from 'src/app/_interfaces/states/ibase.state';

import { Product } from 'src/app/_models/product';

export interface IProductState extends IBaseState, IBaseStateConnection {
  products: Array<Product>;
  importLoading: boolean;
  importProductsResult: boolean;
  importedProducts: Array<IProductPayload>;
  totalCount: number;
  textProductInventories: Array<Product>;
}
