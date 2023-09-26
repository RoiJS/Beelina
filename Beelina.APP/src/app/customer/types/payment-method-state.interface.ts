import { IBaseStateConnection } from 'src/app/_interfaces/states/ibase-connection.state';
import { IBaseState } from 'src/app/_interfaces/states/ibase.state';
import { CustomerStore } from 'src/app/_models/customer-store';

export interface ICustomerStoreState extends IBaseState, IBaseStateConnection {
  customers: Array<CustomerStore>;
  isUpdateLoading: boolean;
}
