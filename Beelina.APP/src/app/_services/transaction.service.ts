import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Store } from '@ngrx/store';

import { Apollo, gql, MutationResult } from 'apollo-angular';
import { map, take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

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

import {
  endCursorSelector as endCursorSelectorTopSellingProducts,
  fromDateSelector as fromDateSelectorTopSellingProducts,
  sortOrderSelector as sortOrderSelectorTopSellingProducts,
  toDateSelector as toDateSelectorTopSellingProducts,
} from '../product/top-products/store/selectors';

import { DateRange } from '../_models/date-range';
import { SalesPerDateRange } from '../_models/sales-per-date-range';
import { TransactionSalesPerSalesAgent } from '../_models/sales-per-agent';
import { ITransactionInformationOutput } from '../_interfaces/outputs/itransaction-information.output';
import { OutletTypeEnum } from '../_enum/outlet-type.enum';

const REGISTER_TRANSACTION_MUTATION = gql`
  mutation ($transactionInput: TransactionInput!) {
    registerTransaction(input: { transactionInput: $transactionInput }) {
      transaction {
        id
      }
    }
  }
`;

const DELETE_TRANSACTION = gql`
  mutation ($transactionId: Int!) {
    deleteTransaction(input: { transactionId: $transactionId }) {
      transaction {
        id
      }
    }
  }
`;

const DELETE_TRANSACTIONS_BY_DATE = gql`
  mutation($transactionStatus: TransactionStatusEnum!, $transactionDate: String!) {
    deleteTransactionsByDate(input: { transactionStatus: $transactionStatus, transactionDate: $transactionDate }) {
      transactionInformation {
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
      invoiceNo
      storeId
      storeName
      transactionDate
      hasUnpaidProductTransaction
    }
  }
`;

const GET_TRANSACTION = gql`
  query ($transactionId: Int!) {
    transaction(transactionId: $transactionId) {
      transaction {
        id
        storeId
        invoiceNo
        discount
        transactionDate
        dueDate
        hasUnpaidProductTransaction
        total
        balance
        modeOfPayment
        store {
          id
          name
          address
          paymentMethod {
            id
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
            productUnit {
                name
            }
          }
        }
      }
      badOrderAmount
    }
  }
`;

const UPDATE_MODE_OF_PAYMENT = gql`
  mutation ($transactionId: Int!, $modeOfPayment: Int!) {
    updateModeOfPayment(input: { transactionId: $transactionId, modeOfPayment: $modeOfPayment }) {
      transaction {
        id
      }
    }
  }
`;

const GET_TOP_SELLING_PRODUCTS = gql`
  query(
    $userId: Int!,
    $fromDate: String,
    $toDate: String
    $cursor: String
    $sortOrder: SortEnumType,
  ) {
    topSellingProducts(
        userId: $userId
        fromDate: $fromDate
        toDate: $toDate
        after: $cursor
        order: [{totalAmount : $sortOrder }]
    ) {
      nodes {
        id
        code
        name
        unitName
        count
        totalAmount
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      totalCount
    }
  }
`;

const GET_TRANSACTION_SALES = gql`
  query ($userId: Int!, $fromDate: String!, $toDate: String!) {
    transactionSales(userId: $userId, fromDate: $fromDate, toDate: $toDate) {
      totalSalesAmount
      cashAmountOnHand
      chequeAmountOnHand
      totalAmountOnHand
    }
  }
`;

const GET_TRANSACTION_SALES_PER_DATE_RANGE_QUERY = gql`
  query ($userId: Int!, $dateRanges: [DateRangeInput!]!) {
    transactionSalesPerDateRange(userId: $userId, dateRanges: $dateRanges) {
      fromDate
      toDate
      label
      totalSales
      cashAmountOnHand
      chequeAmountOnHand
      totalAmountOnHand
    }
  }
`;

const GET_TRANSACTION_SALES_FOR_ALL_PER_DATE_RANGE_QUERY = gql`
  query ($fromDate: String!, $toDate: String!) {
    salesForAllSalesAgent(fromDate: $fromDate, toDate: $toDate) {
      id
      salesAgentName
      sales
    }
  }
`;

const GET_CUSTOMER_SALES_PRODUCTS_QUERY = gql`
  query(
    $storeId: Int!
  ) {
  customerSaleProducts (
        storeId: $storeId
    ) {
        productId
        productCode
        productName
        unit
        totalSalesAmount
    }
  }
`;
const GET_TOP_CUSTOMER_SALES_QUERY = gql`
  query(
    $storeId: Int!,
    $fromDate: String!,
    $toDate: String!
  ) {
  topCustomerSales (
        storeId: $storeId
        fromDate: $fromDate
        toDate: $toDate
    ) {
        storeId
        storeName
        outletType
        totalSalesAmount
    }
  }
`;

const SEND_ORDER_RECEIPT_EMAIL_NOTIFICATION = gql`
  query($transactionId: Int!) {
    sendTransactionEmailReceipt(transactionId: $transactionId)
  }
`;

export class TransactionInformation {
  public id: number;
  public invoiceNo: string;
  public storeId: number;
  public storeName: string;
  public transactionDate: Date;
  public hasUnpaidProductTransaction: boolean;
}

export class Transaction extends Entity implements IModelNode {
  public storeId: number;
  public invoiceNo: string;
  public discount: number;
  public transactionDate: Date;
  public dueDate: Date;
  public store: CustomerStore;
  public modeOfPayment: number;
  public productTransactions: Array<ProductTransaction>;
  public hasUnpaidProductTransaction: boolean;
  public balance: number;
  public total: number;
  public badOrderAmount: number;

  get transactionDateFormatted(): string {
    return DateFormatter.format(this.transactionDate, 'MMM DD, YYYY');
  }

  get dueDateFormatted(): string {
    return DateFormatter.format(this.dueDate, 'MMM DD, YYYY');
  }

  get grossTotalFormatted(): string {
    return NumberFormatter.formatCurrency(this.total);
  }

  get badOrderFormatted(): string {
    return NumberFormatter.formatCurrency(this.badOrderAmount);
  }

  get netTotalFormatted(): string {
    const calculatedNetTotalAmount =
      (this.total - (this.discount / 100) * this.total) - this.badOrderAmount;
    return NumberFormatter.formatCurrency(calculatedNetTotalAmount);
  }

  get balanceFormatted(): string {
    return NumberFormatter.formatCurrency(this.balance);
  }

  constructor() {
    super();
    this.productTransactions = new Array<ProductTransaction>();
    this.store = new CustomerStore();
  }
}

export class TransactionDetails {
  public transaction: Transaction;
  public badOrderAmount: number;
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
  public totalSalesAmount: number;
  public cashAmountOnHand: number;
  public chequeAmountOnHand: number;
  public totalAmountOnHand: number;
}

export class TransactionDto {
  public id: number = 0;
  public invoiceNo: string;
  public discount: number;
  public storeId: number;
  public modeOfPayment: number;
  public status: TransactionStatusEnum;
  public transactionDate: string;
  public dueDate: string;
  public productTransactions: Array<ProductTransaction>;
}

export interface IMarkTransactionAsPaidPayLoad {
  id: number;
  name: string;
}

export class TopSellingProduct {
  public id: number;
  public code: string;
  public unitName: string;
  public name: string;
  public count: number;
  public totalAmount: number;

  get totalAmountFormatted(): string {
    return NumberFormatter.formatCurrency(this.totalAmount);
  }
}

export class CustomerSale {
  public storeId: number;
  public storeName: string;
  public outletType: string;
  public totalSalesAmount: number;

  get totalSalesAmountFormatted(): string {
    return NumberFormatter.formatCurrency(this.totalSalesAmount);
  }
}

export class CustomerSaleProduct {
  public productId: number;
  public productCode: string;
  public productName: string;
  public unit: string;
  public totalSalesAmount: number;

  get totalSalesAmountFormatted(): string {
    return NumberFormatter.formatCurrency(this.totalSalesAmount);
  }
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(
    private apollo: Apollo,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService,
  ) { }

  registerTransaction(transaction: TransactionDto) {
    const transactionInput: ITransactionInput = {
      id: transaction.id,
      invoiceNo: transaction.invoiceNo,
      discount: transaction.discount,
      storeId: transaction.storeId,
      modeOfPayment: transaction.modeOfPayment,
      status: transaction.status,
      transactionDate: transaction.transactionDate,
      dueDate: transaction.dueDate,
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

  deleteTransaction(transactionId: number) {
    return this.apollo
      .mutate({
        mutation: DELETE_TRANSACTION,
        variables: {
          transactionId,
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{ deleteTransaction: ITransactionOutput }>
          ) => {
            const output = result.data.deleteTransaction;
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

  deleteTransactionsByDate(transactionStatus: TransactionStatusEnum, transactionDate: string) {
    return this.apollo
      .mutate({
        mutation: DELETE_TRANSACTIONS_BY_DATE,
        variables: {
          transactionStatus,
          transactionDate
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{ deleteTransactionsByDate: ITransactionInformationOutput }>
          ) => {
            const output = result.data.deleteTransactionsByDate;
            const payload = output.transactionInformation;
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
              transactionsByDate: Array<TransactionInformation>;
            }>
          ) => {
            return result.data.transactionsByDate.map((t) => {
              const transaction = new Transaction();
              transaction.id = t.id;
              transaction.invoiceNo = t.invoiceNo;
              transaction.storeId = t.storeId;
              transaction.store.name = t.storeName;
              transaction.hasUnpaidProductTransaction =
                t.hasUnpaidProductTransaction;
              return transaction;
            });
          }
        )
      );
  }

  sendOrderReceiptEmailNotification(
    transactionId: number
  ) {
    return this.apollo
      .watchQuery({
        query: SEND_ORDER_RECEIPT_EMAIL_NOTIFICATION,
        variables: {
          transactionId
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              sendTransactionEmailReceipt: boolean;
            }>
          ) => {
            return result.data.sendTransactionEmailReceipt;
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
              transaction: TransactionDetails;
            }>
          ) => {
            const transactionFromRepo = result.data.transaction;
            const transaction = new Transaction();
            transaction.id = transactionFromRepo.transaction.id;
            transaction.badOrderAmount = transactionFromRepo.badOrderAmount;
            transaction.invoiceNo = transactionFromRepo.transaction.invoiceNo;
            transaction.discount = transactionFromRepo.transaction.discount;
            transaction.transactionDate = transactionFromRepo.transaction.transactionDate;
            transaction.dueDate = transactionFromRepo.transaction.dueDate;
            transaction.storeId = transactionFromRepo.transaction.storeId;
            transaction.store = transactionFromRepo.transaction.store;
            transaction.modeOfPayment = transactionFromRepo.transaction.modeOfPayment;
            transaction.balance = transactionFromRepo.transaction.balance;
            transaction.total = transactionFromRepo.transaction.total;
            transaction.hasUnpaidProductTransaction =
              transactionFromRepo.transaction.hasUnpaidProductTransaction;
            transaction.productTransactions =
              transactionFromRepo.transaction.productTransactions.map((pt) => {
                const productTransaction = new ProductTransaction();
                productTransaction.id = pt.id;
                productTransaction.quantity = pt.quantity;
                productTransaction.currentQuantity = pt.currentQuantity;
                productTransaction.price = pt.price;
                productTransaction.status = pt.status;
                productTransaction.productName = pt.product.name;
                productTransaction.productId = pt.product.id;
                productTransaction.code = pt.product.code;

                productTransaction.product = new Product();
                productTransaction.product.id = pt.product.id;
                productTransaction.product.code = pt.product.code;
                productTransaction.product.name = pt.product.name;
                productTransaction.product.price = pt.product.price;
                productTransaction.product.productUnit = pt.product.productUnit;
                return productTransaction;
              });

            return transaction;
          }
        )
      );
  }

  getTransactioDates(transactionStatus: TransactionStatusEnum) {
    let cursor = null,
      sortOrder = SortOrderOptionsEnum.DESCENDING,
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

  getTopSellingProducts(userId: number, useStore: boolean = true) {

    let cursor = null,
      sortOrder = SortOrderOptionsEnum.DESCENDING,
      fromDate = null,
      toDate = null;

    if (useStore) {
      this.store
        .select(endCursorSelectorTopSellingProducts)
        .pipe(take(1))
        .subscribe((currentCursor) => (cursor = currentCursor));

      this.store
        .select(sortOrderSelectorTopSellingProducts)
        .pipe(take(1))
        .subscribe((currentSortOrder) => (sortOrder = currentSortOrder));

      this.store
        .select(fromDateSelectorTopSellingProducts)
        .pipe(take(1))
        .subscribe((currentFromDate) => (fromDate = currentFromDate));

      this.store
        .select(toDateSelectorTopSellingProducts)
        .pipe(take(1))
        .subscribe((currentToDate) => (toDate = currentToDate));
    }

    return this.apollo
      .watchQuery({
        query: GET_TOP_SELLING_PRODUCTS,
        variables: {
          userId,
          fromDate,
          toDate,
          cursor,
          sortOrder
        }
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ topSellingProducts: IBaseConnection }>) => {
          const data = result.data.topSellingProducts;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const totalCount = data.totalCount;
          const topProducts = <Array<TopSellingProduct>>data.nodes;

          const topSellingProducts: Array<TopSellingProduct> = topProducts.map((stockAudit: TopSellingProduct) => {
            const topProducts = new TopSellingProduct();
            topProducts.id = stockAudit.id;
            topProducts.code = stockAudit.code;
            topProducts.name = stockAudit.name;
            topProducts.unitName = stockAudit.unitName;
            topProducts.count = stockAudit.count;
            topProducts.totalAmount = stockAudit.totalAmount;
            return topProducts;
          });

          if (topSellingProducts) {
            return {
              endCursor,
              hasNextPage,
              totalCount,
              topSellingProducts,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getTransactionSales(userId: number, fromDate: string = '', toDate: string = '') {

    return this.apollo
      .watchQuery({
        query: GET_TRANSACTION_SALES,
        variables: { userId, fromDate, toDate },
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

  getTransactionSalesPerDateRange(userId: number, dateRanges: Array<DateRange>) {
    return this.apollo
      .watchQuery({
        query: GET_TRANSACTION_SALES_PER_DATE_RANGE_QUERY,
        variables: { userId, dateRanges },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              transactionSalesPerDateRange: Array<SalesPerDateRange>;
            }>
          ) => {
            return result.data.transactionSalesPerDateRange;
          }
        )
      );
  }

  getTransactionSalesForAllPerDateRange(fromDate: string = '', toDate: string = '') {
    return this.apollo
      .watchQuery({
        query: GET_TRANSACTION_SALES_FOR_ALL_PER_DATE_RANGE_QUERY,
        variables: { fromDate, toDate },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              salesForAllSalesAgent: Array<TransactionSalesPerSalesAgent>;
            }>
          ) => {
            const data = result.data.salesForAllSalesAgent;
            const salesForAllSalesAgents = <Array<TransactionSalesPerSalesAgent>>(
              data.map((t: TransactionSalesPerSalesAgent) => {
                const transactionSalesPerSalesAgent = new TransactionSalesPerSalesAgent();
                transactionSalesPerSalesAgent.id = t.id;
                transactionSalesPerSalesAgent.salesAgentName = t.salesAgentName;
                transactionSalesPerSalesAgent.sales = t.sales;
                return transactionSalesPerSalesAgent;
              })
            )
            return salesForAllSalesAgents;
          }
        )
      );
  }

  getTopStoresSales(storeId: number = 0, fromDate: string = '', toDate: string = '') {
    return this.apollo
      .watchQuery({
        query: GET_TOP_CUSTOMER_SALES_QUERY,
        variables: { storeId, fromDate, toDate },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              topCustomerSales: Array<CustomerSale>;
            }>
          ) => {
            const data = result.data.topCustomerSales;
            const customerSales = <Array<CustomerSale>>(
              data.map((t: CustomerSale) => {
                const customerSale = new CustomerSale();
                customerSale.storeId = t.storeId;
                customerSale.storeName = t.storeName;
                customerSale.outletType = t.outletType === OutletTypeEnum.GEN_TRADE ? this.translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.GEN_TRADE') : this.translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.KEY_ACCOUNT');
                customerSale.totalSalesAmount = t.totalSalesAmount;
                return customerSale;
              })
            )
            return customerSales;
          }
        )
      );
  }

  getStoresSalesProducts(storeId: number) {
    return this.apollo
      .watchQuery({
        query: GET_CUSTOMER_SALES_PRODUCTS_QUERY,
        variables: { storeId },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              customerSaleProducts: Array<CustomerSaleProduct>;
            }>
          ) => {
            const data = result.data.customerSaleProducts;
            const customerSales = <Array<CustomerSaleProduct>>(
              data.map((t: CustomerSaleProduct) => {
                const customerSale = new CustomerSaleProduct();
                customerSale.productId = t.productId;
                customerSale.productCode = t.productCode;
                customerSale.productName = t.productName;
                customerSale.unit = t.unit;
                customerSale.totalSalesAmount = t.totalSalesAmount;
                return customerSale;
              })
            )
            return customerSales;
          }
        )
      );
  }

  updateModeOfPayment(transactionId: number, modeOfPayment: number) {
    return this.apollo
      .mutate({
        mutation: UPDATE_MODE_OF_PAYMENT,
        variables: {
          transactionId,
          modeOfPayment
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{
              updateModeOfPayment: ITransactionOutput;
            }>
          ) => {
            const output = result.data.updateModeOfPayment;
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
