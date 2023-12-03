import { ILoginAuthCredentialsState } from '../auth/types/login-state.interface';
import { IBarangayState } from '../barangays/types/barangay.interface';
import { ICustomerStoreState } from '../customer/types/payment-method-state.interface';
import { IPaymentMethodState } from '../payment-methods/types/payment-method-state.interface';
import { IProductTransactionState } from '../product/add-to-cart-product/store/types/product-transaction-state.interface';
import { IProductState } from '../product/types/product-state.interface';
import { IProductStockAuditState } from '../product/edit-product-details/manage-product-stock-audit/store/types/product-state.interface';
import { ITransactionDateState } from '../transaction-history/types/transaction-dates-state.interface';
import { IProductUnitState } from '../units/types/product-unit-state.interface';

export interface AppStateInterface {
  authCredentials: ILoginAuthCredentialsState;
  paymentMethods: IPaymentMethodState;
  barangays: IBarangayState;
  productUnits: IProductUnitState;
  products: IProductState;
  productStockAudits: IProductStockAuditState;
  customerStores: ICustomerStoreState;
  transactionDates: ITransactionDateState;
  productTransactions: IProductTransactionState;
}
