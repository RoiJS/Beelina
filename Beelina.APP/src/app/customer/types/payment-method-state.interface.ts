import {
  IBaseState,
  IBaseStateConnection,
} from 'src/app/payment-methods/types/payment-method-state.interface';

import { CustomerStore } from 'src/app/_services/customer-store.service';

export interface ICustomerStoreState extends IBaseState, IBaseStateConnection {
  customers: Array<CustomerStore>;
  isUpdateLoading: boolean;
}
