import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Store } from '@ngrx/store';

import { Apollo, gql, MutationResult } from 'apollo-angular';
import { delay, map, take } from 'rxjs';

import { Entity } from '../_models/entity.model';
import { Product } from '../_models/product';
import { ProductTransaction } from '../_models/transaction';

import { CustomerStore } from '../_models/customer-store';

import { IModelNode } from '../_interfaces/imodel-node';

import { TransactionStatusEnum } from '../_enum/transaction-status.enum';

import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { IProductTransactionInput } from '../_interfaces/inputs/iproduct-transaction.input';
import { ITransactionInput } from '../_interfaces/inputs/itransaction.input';
import { ITransactionOutput } from '../_interfaces/outputs/itransaction.output';

import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { AppStateInterface } from '../_interfaces/app-state.interface';
import { IBaseConnection } from '../_interfaces/connections/ibase.connection';
import {
  endCursorSelector,
  fromDateSelector,
  sortOrderSelector,
  toDateSelector,
} from '../transaction-history/store/selectors';

const REGISTER_TRANSACTION_MUTATION = gql`
  mutation ($transactionInput: TransactionInput!) {
    registerTransaction(input: { transactionInput: $transactionInput }) {
      transaction {
        id
      }
    }
  }
`;

const GET_TRANSACTION_DATES = gql`
  query (
    $cursor: String
    $sortOrder: SortEnumType
    $transactionStatus: TransactionStatusEnum!
    $fromDate: String
    $toDate: String
  ) {
    transactionDates(
      after: $cursor
      order: [{ transactionDate: $sortOrder }]
      transactionStatus: $transactionStatus
      fromDate: $fromDate
      toDate: $toDate
    ) {
      edges {
        cursor
        node {
          transactionDate
          allTransactionsPaid
        }
      }
      nodes {
        transactionDate
        allTransactionsPaid
        numberOfUnPaidTransactions
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

const GET_APPROVED_TRANSACTIONS_BY_DATE = gql`
  query ($transactionDate: String!, $status: TransactionStatusEnum!) {
    transactionsByDate(transactionDate: $transactionDate, status: $status) {
      id
      storeId
      transactionDate
      hasUnpaidProductTransaction
      store {
        name
      }
    }
  }
`;

const GET_TRANSACTION = gql`
  query ($transactionId: Int!) {
    transaction(transactionId: $transactionId) {
      id
      storeId
      invoiceNo
      transactionDate
      hasUnpaidProductTransaction
      total
      balance
      store {
        id
        name
        address
        paymentMethod {
          name
        }
        barangay {
          name
        }
      }
      productTransactions {
        id
        transactionId
        productId
        quantity
        price
        status
        currentQuantity
        product {
          id
          code
          name
          price
        }
      }
    }
  }
`;

const MARK_TRANSACTION_AS_PAID = gql`
  mutation ($transactionId: Int!) {
    markTransactionAsPaid(input: { transactionId: $transactionId }) {
      transaction {
        id
      }
    }
  }
`;

const GET_TOP_PRODUCTS = gql`
  query {
    topProducts {
      id
      code
      name
      count
    }
  }
`;

const GET_TRANSACTION_SALES = gql`
  query ($fromDate: String!, $toDate: String!) {
    transactionSales(fromDate: $fromDate, toDate: $toDate) {
      sales
    }
  }
`;

export class Transaction extends Entity implements IModelNode {
  public storeId: number;
  public invoiceNo: string;
  public transactionDate: Date;
  public store: CustomerStore;
  public productTransactions: Array<ProductTransaction>;
  public hasUnpaidProductTransaction: boolean;
  public balance: number;
  public total: number;

  get transactionDateFormatted(): string {
    return DateFormatter.format(this.transactionDate, 'MMM DD, YYYY');
  }

  get totalFormatted(): string {
    return NumberFormatter.formatCurrency(this.total);
  }

  get balanceFormatted(): string {
    return NumberFormatter.formatCurrency(this.balance);
  }

  constructor() {
    super();
    this.productTransactions = new Array<ProductTransaction>();
  }
}

export class TransactionDateInformation {
  public transactionDate: Date;
  public allTransactionsPaid: boolean;
  public numberOfUnPaidTransactions: number;

  get transactionDateFormatted(): string {
    return DateFormatter.format(this.transactionDate, 'MMM DD, YYYY');
  }
}

export class TransactionSales {
  public sales: number;
}

export class TransactionDto {
  public id: number = 0;
  public invoiceNo: string;
  public storeId: number;
  public status: TransactionStatusEnum;
  public transactionDate: string;
  public productTransactions: Array<ProductTransaction>;
}

export interface IMarkTransactionAsPaidPayLoad {
  id: number;
  name: string;
}

export class TransactionTopProduct {
  public id: number;
  public code: string;
  public name: string;
  public count: number;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(
    private apollo: Apollo,
    private store: Store<AppStateInterface>
  ) {}

  registerTransaction(transaction: TransactionDto) {
    const transactionInput: ITransactionInput = {
      id: transaction.id,
      invoiceNo: transaction.invoiceNo,
      storeId: transaction.storeId,
      status: transaction.status,
      transactionDate: transaction.transactionDate,
      productTransactionInputs: transaction.productTransactions.map((p) => {
        const productTransaction: IProductTransactionInput = {
          id: p.id,
          productId: p.productId,
          quantity: p.quantity,
          price: p.price,
          currentQuantity: transaction.id > 0 ? 0 : p.currentQuantity,
        };

        return productTransaction;
      }),
    };

    return this.apollo
      .mutate({
        mutation: REGISTER_TRANSACTION_MUTATION,
        variables: {
          transactionInput,
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{ registerTransaction: ITransactionOutput }>
          ) => {
            const output = result.data.registerTransaction;
            const payload = output.transaction;
            const errors = output.errors;

            if (payload) {
              return payload;
            }

            if (errors && errors.length > 0) {
              throw new Error(errors[0].message);
            }

            return null;
          }
        )
      );
  }

  getTransactionsByDate(
    transactionDate: string,
    status: TransactionStatusEnum
  ) {
    return this.apollo
      .watchQuery({
        query: GET_APPROVED_TRANSACTIONS_BY_DATE,
        variables: {
          transactionDate,
          status,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              transactionsByDate: Array<Transaction>;
            }>
          ) => {
            return result.data.transactionsByDate.map((t) => {
              const transaction = new Transaction();
              transaction.id = t.id;
              transaction.storeId = t.storeId;
              transaction.store = t.store;
              transaction.hasUnpaidProductTransaction =
                t.hasUnpaidProductTransaction;
              return transaction;
            });
          }
        )
      );
  }

  getTransaction(transactionId: number) {
    return this.apollo
      .watchQuery({
        query: GET_TRANSACTION,
        variables: {
          transactionId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              transaction: Transaction;
            }>
          ) => {
            const transactionFromRepo = result.data.transaction;

            const transaction = new Transaction();
            transaction.id = transactionFromRepo.id;
            transaction.invoiceNo = transactionFromRepo.invoiceNo;
            transaction.transactionDate = transactionFromRepo.transactionDate;
            transaction.storeId = transactionFromRepo.storeId;
            transaction.store = transactionFromRepo.store;
            transaction.balance = transactionFromRepo.balance;
            transaction.total = transactionFromRepo.total;
            transaction.hasUnpaidProductTransaction =
              transactionFromRepo.hasUnpaidProductTransaction;
            transaction.productTransactions =
              transactionFromRepo.productTransactions.map((pt) => {
                const productTransaction = new ProductTransaction();
                productTransaction.id = pt.id;
                productTransaction.quantity = pt.quantity;
                productTransaction.currentQuantity = pt.currentQuantity;
                productTransaction.price = pt.price;
                productTransaction.status = pt.status;
                productTransaction.productName = pt.product.name;
                productTransaction.productId = pt.product.id;

                productTransaction.product = new Product();
                productTransaction.product.id = pt.product.id;
                productTransaction.product.code = pt.product.code;
                productTransaction.product.name = pt.product.name;
                productTransaction.product.price = pt.product.price;
                return productTransaction;
              });

            return transaction;
          }
        )
      );
  }

  getTransactioDates(transactionStatus: TransactionStatusEnum) {
    let cursor = null,
      sortOrder = SortOrderOptionsEnum.ASCENDING,
      fromDate = null,
      toDate = null;

    this.store
      .select(endCursorSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    this.store
      .select(sortOrderSelector)
      .pipe(take(1))
      .subscribe((currentSortOrder) => (sortOrder = currentSortOrder));

    this.store
      .select(fromDateSelector)
      .pipe(take(1))
      .subscribe((currentFromDate) => (fromDate = currentFromDate));

    this.store
      .select(toDateSelector)
      .pipe(take(1))
      .subscribe((currentToDate) => (toDate = currentToDate));

    return this.apollo
      .watchQuery({
        query: GET_TRANSACTION_DATES,
        variables: {
          cursor,
          sortOrder,
          transactionStatus,
          fromDate,
          toDate,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              transactionDates: IBaseConnection;
            }>
          ) => {
            const data = result.data.transactionDates;
            const errors = result.errors;
            const endCursor = data.pageInfo.endCursor;
            const hasNextPage = data.pageInfo.hasNextPage;
            const transactionDates = <Array<TransactionDateInformation>>(
              data.nodes.map((t: TransactionDateInformation) => {
                const transactionHistoryDate = new TransactionDateInformation();
                transactionHistoryDate.transactionDate = t.transactionDate;
                transactionHistoryDate.numberOfUnPaidTransactions =
                  t.numberOfUnPaidTransactions;
                transactionHistoryDate.allTransactionsPaid =
                  t.allTransactionsPaid;
                return transactionHistoryDate;
              })
            );

            if (transactionDates) {
              return {
                endCursor,
                hasNextPage,
                transactionDates,
              };
            }

            if (errors && errors.length > 0) {
              throw new Error(errors[0].message);
            }

            return null;
          }
        )
      );
  }

  getTopProducts() {
    return this.apollo
      .watchQuery({
        query: GET_TOP_PRODUCTS,
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              topProducts: Array<TransactionTopProduct>;
            }>
          ) => {
            const dates = result.data.topProducts.map((t) => {
              const topProducts = new TransactionTopProduct();
              topProducts.id = t.id;
              topProducts.code = t.code;
              topProducts.name = t.name;
              topProducts.count = t.count;
              return topProducts;
            });

            return dates;
          }
        )
      );
  }

  getTransactionSales(fromDate: string = '', toDate: string = '') {
    return this.apollo
      .watchQuery({
        query: GET_TRANSACTION_SALES,
        variables: { fromDate, toDate },
      })
      .valueChanges.pipe(
        delay(1000),
        map(
          (
            result: ApolloQueryResult<{
              transactionSales: TransactionSales;
            }>
          ) => {
            return result.data.transactionSales;
          }
        )
      );
  }

  markTransactionAsPaid(transactionId: number) {
    return this.apollo
      .mutate({
        mutation: MARK_TRANSACTION_AS_PAID,
        variables: {
          transactionId,
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{
              markTransactionAsPaid: ITransactionOutput;
            }>
          ) => {
            const output = result.data.markTransactionAsPaid;
            const payload = output.transaction;
            const errors = output.errors;

            if (payload) {
              return payload;
            }

            if (errors && errors.length > 0) {
              throw new Error(errors[0].message);
            }

            return null;
          }
        )
      );
  }
}
