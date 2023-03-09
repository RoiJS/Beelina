import { ILoginAuthCredentialsState } from '../auth/types/login-state.interface';
import { ICustomerStoreState } from '../customer/types/payment-method-state.interface';
import { IPaymentMethodState } from '../payment-methods/types/payment-method-state.interface';
import { IProductTransactionState } from '../product/add-to-cart-product/store/types/product-transaction-state.interface';
import { IProductState } from '../product/types/product-state.interface';
import { IProductUnitState } from '../units/types/product-unit-state.interface';

export interface AppStateInterface {
  authCredentials: ILoginAuthCredentialsState;
  paymentMethods: IPaymentMethodState;
  productUnits: IProductUnitState;
  products: IProductState;
  customerStores: ICustomerStoreState;
  productTransactions: IProductTransactionState;
}
