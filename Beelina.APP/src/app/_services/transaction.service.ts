import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';

import { Apollo, gql, MutationResult } from 'apollo-angular';
import { map } from 'rxjs';

import { Entity } from '../_models/entity.model';
import { Product } from '../_models/product';
import { ProductTransaction } from '../_models/transaction';

import { CustomerStore } from '../_models/customer-store';

import { IModelNode } from '../_interfaces/imodel-node';

import { TransactionStatusEnum } from '../_enum/transaction-status.enum';

import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { ITransactionInput } from '../_interfaces/inputs/itransaction.input';
import { IProductTransactionInput } from '../_interfaces/inputs/iproduct-transaction.input';
import { ITransactionOutput } from '../_interfaces/outputs/itransaction.output';

const REGISTER_TRANSACTION_MUTATION = gql`
  mutation ($transactionInput: TransactionInput!) {
    registerTransaction(input: { transactionInput: $transactionInput }) {
      transaction {
        id
      }
    }
  }
`;

const GET_APPROVED_TRANSACTION_HISTORY_DATES = gql`
  query ($transactionDate: String!) {
    approvedTransactionDates(transactionDate: $transactionDate) {
      transactionDate
      allTransactionsPaid
    }
  }
`;

const GET_DRAFT_TRANSACTION_HISTORY_DATES = gql`
  query ($transactionDate: String!) {
    draftTransactionDates(transactionDate: $transactionDate) {
      transactionDate
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

  get transactionDateFormatted(): string {
    return DateFormatter.format(this.transactionDate, 'MMM DD, YYYY');
  }
}

export class TransactionSales {
  public sales: number;
}

export class TransactionDto {
  public id: number = 0;
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
  constructor(private apollo: Apollo) {}

  registerTransaction(transaction: TransactionDto) {
    const transactionInput: ITransactionInput = {
      id: transaction.id,
      storeId: transaction.storeId,
      status: transaction.status,
      transactionDate: transaction.transactionDate,
      productTransactionInputs: transaction.productTransactions.map((p) => {
        const productTransaction: IProductTransactionInput = {
          id: p.id,
          productId: p.productId,
          quantity: p.quantity,
          price: p.price,
          currentQuantity: p.currentQuantity,
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
                productTransaction.product.name = pt.product.name;
                productTransaction.product.price = pt.product.price;
                return productTransaction;
              });

            return transaction;
          }
        )
      );
  }

  getApprovedTransactioHistoryDates(transactionDate: string = '') {
    return this.apollo
      .watchQuery({
        query: GET_APPROVED_TRANSACTION_HISTORY_DATES,
        variables: {
          transactionDate,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              approvedTransactionDates: Array<TransactionDateInformation>;
            }>
          ) => {
            const dates = result.data.approvedTransactionDates.map((t) => {
              const transactionHistoryDate = new TransactionDateInformation();
              transactionHistoryDate.transactionDate = t.transactionDate;
              transactionHistoryDate.allTransactionsPaid =
                t.allTransactionsPaid;
              return transactionHistoryDate;
            });

            return dates;
          }
        )
      );
  }

  getDraftTransactioHistoryDates(transactionDate: string = '') {
    return this.apollo
      .watchQuery({
        query: GET_DRAFT_TRANSACTION_HISTORY_DATES,
        variables: {
          transactionDate,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              draftTransactionDates: Array<TransactionDateInformation>;
            }>
          ) => {
            const dates = result.data.draftTransactionDates.map((t) => {
              const transactionHistoryDate = new TransactionDateInformation();
              transactionHistoryDate.transactionDate = t.transactionDate;
              return transactionHistoryDate;
            });

            return dates;
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
