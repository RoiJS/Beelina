import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Store } from '@ngrx/store';

import { Apollo, gql, MutationResult } from 'apollo-angular';
import { map, take } from 'rxjs';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import { ProductNotExistsError } from '../_models/errors/product-not-exists.error';

import {
  endCursorSelector,
  filterKeywordSelector,
} from '../product/store/selectors';
import {
  endCursorSelector as endCursorProductStockAuditSelector, fromDateSelector, sortOrderSelector, stockAuditSourceSelector, toDateSelector,
} from '../product/edit-product-details/manage-product-stock-audit/store/selectors';
import { productTransactionsSelector } from '../product/add-to-cart-product/store/selectors';

import { CheckProductCodeInformationResult } from '../_models/results/check-product-code-information-result';
import { ProductInformationResult } from '../_models/results/product-information-result';

import { IBaseConnection } from '../_interfaces/connections/ibase.connection';
import { IProductInput } from '../_interfaces/inputs/iproduct.input';
import { IProductOutput } from '../_interfaces/outputs/iproduct.output';
import { Product } from '../_models/product';
import { ProductTransaction } from '../_models/transaction';
import { InsufficientProductQuantity } from '../_models/insufficient-product-quantity';

import { IValidateProductQuantitiesQueryPayload } from '../_interfaces/payloads/ivalidate-product-quantities-query.payload';
import { IProductInformationQueryPayload } from '../_interfaces/payloads/iproduct-information-query.payload';
import { IProductTransactionQueryPayload } from '../_interfaces/payloads/iproduct-transaction-query.payload';
import { ITextProductInventoryQueryPayload } from '../_interfaces/payloads/itext-product-inventory-query.payload';

import { User } from '../_models/user.model';
import { StorageService } from './storage.service';
import { ProductStockAudit } from '../_models/product-stock-audit';
import { IProductStockAuditOutput } from '../_interfaces/outputs/iproduct-stock-update.output';
import { TransferProductStockTypeEnum } from '../_enum/transfer-product-stock-type.enum';
import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { ProductStockAuditItem } from '../_models/product-stock-audit-item';
import { StockAuditSourceEnum } from '../_enum/stock-audit-source.enum';

const GET_PRODUCTS_QUERY = gql`
  query ($userAccountId: Int!, $cursor: String, $filterKeyword: String) {
    products(
      userAccountId: $userAccountId
      after: $cursor
      filterKeyword: $filterKeyword
    ) {
      nodes {
        id
        name
        code
        description
        stockQuantity
        pricePerUnit
        price
        numberOfUnits
        isTransferable
        productUnit {
          id
          name
        }
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

const GET_PRODUCT_STORE = gql`
  query ($productId: Int!, $userAccountId: Int!) {
    product(productId: $productId, userAccountId: $userAccountId) {
      typename: __typename
      ... on ProductInformationResult {
        id
        name
        code
        description
        stockQuantity
        pricePerUnit
        price
        numberOfUnits
        isTransferable
        productUnit {
          name
        }
      }
      ... on ProductNotExistsError {
        message
      }
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = gql`
  mutation($productInputs: [ProductInput!]!, $userAccountId: Int!) {
    updateProducts(input: { productInputs: $productInputs, userAccountId:  $userAccountId }){
      product {
        name
      }
      errors {
          __typename
          ... on ProductFailedRegisterError {
              message
          }
          ... on BaseError {
              message
          }
        }
      }
  }
`;

const DELETE_PRODUCT = gql`
  mutation ($productId: Int!) {
    deleteProduct(input: { productId: $productId }) {
      product {
        name
      }
    }
  }
`;

const CHECK_PRODUCT_CODE = gql`
  query ($productId: Int!, $productCode: String!) {
    checkProductCode(productId: $productId, productCode: $productCode) {
      typename: __typename
      ... on CheckProductCodeInformationResult {
        exists
      }
    }
  }
`;

const VALIDATE_PRODUCT_QUANTITIES = gql`
  query (
    $userAccountId: Int!
    $productTransactionsInputs: [ProductTransactionInput!]!
  ) {
    validateProductionTransactionsQuantities(
      productTransactionsInputs: $productTransactionsInputs
      userAccountId: $userAccountId
    ) {
      productId
      productName
      productCode
      selectedQuantity
      currentQuantity
    }
  }
`;

const ANALYZE_TEXT_ORDERS = gql`
  query ($textOrders: String!) {
    analyzeTextOrders(textOrders: $textOrders) {
      id
      code
      productId
      productName
      quantity
      price
      currentQuantity
    }
  }
`;

const ANALYZE_TEXT_INVENTORIES = gql`
  query ($userAccountId: Int!, $textInventories: String!) {
    analyzeTextInventories(userAccountId: $userAccountId, textInventories: $textInventories) {
      id
      name
      code
      description
      additionalQuantity
      price
      isTransferable
      numberOfUnits
      withdrawalSlipNo
      productUnit {
        id
        name
      }
    }
  }
`;

const GET_SALES_AGENTS_LIST = gql`
  query {
    salesAgents {
      id
      firstName
      lastName
      username
    }
  }
`;

const GET_PRODUCT_DETAILS_LIST = gql`
  query ($userAccountId: Int!, $filterKeyword: String) {
    productsDetailList(
      userAccountId: $userAccountId,
      filterKeyword: $filterKeyword
    ) {
        id
        name
        code
        productUnit {
          name
        }
    }
  }
`;

const GET_PRODUCT_STOCK_AUDITS_LIST = gql`
  query (
    $productId: Int!,
    $userAccountId: Int!,
    $stockAuditSource: StockAuditSourceEnum!,
    $sortOrder: SortEnumType
    $fromDate: String,
    $toDate: String,
    $cursor: String) {
    productStockAuditItems(
        after: $cursor
        order: [{ modifiedDate: $sortOrder }]
        stockAuditSource: $stockAuditSource,
        productId: $productId,
        userAccountId: $userAccountId,
        fromDate: $fromDate,
        toDate: $toDate) {
      nodes {
        id
        quantity
        transactionNumber
        stockAuditSource
        modifiedBy
        modifiedDate
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

const UPDATE_PRODUCT_STOCK_AUDIT = gql`
  mutation($productStockAuditId: Int!, $withdrawalSlipNo: String!, $newQuantity: Int!) {
    updateProductStockAudit(input: {
          productStockAuditId: $productStockAuditId,
          withdrawalSlipNo: $withdrawalSlipNo,
          newQuantity: $newQuantity
      }){
      productStockAudit {
          id
      }
      errors {
              __typename
              ... on ProductStockAuditNotExistsError {
                  message
              }
              ... on BaseError {
                  message
              }
          }
      }
  }
`;

const TRANSFER_PRODUCT_STOCK_FROM_OWN_INVENTORY_QUERY = gql`
  mutation(
    $userAccountId: Int!,
    $sourceProductId: Int!,
    $destinationProductId: Int!,
    $destinationProductNumberOfUnits: Int!,
    $sourceProductNumberOfUnits: Int!,
    $sourceNumberOfUnitsTransfered: Int!,
    $transferProductStockType: TransferProductStockTypeEnum!
  ) {
    transferProductStockFromOwnInventory(input: {
      userAccountId: $userAccountId,
      sourceProductId:  $sourceProductId,
      destinationProductId:  $destinationProductId,
      destinationProductNumberOfUnits: $destinationProductNumberOfUnits,
      sourceProductNumberOfUnits:  $sourceProductNumberOfUnits,
      sourceNumberOfUnitsTransfered:  $sourceNumberOfUnitsTransfered,
      transferProductStockType: $transferProductStockType
    }){
      product {
          name
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(
    private apollo: Apollo,
    private store: Store<AppStateInterface>,
    private storageService: StorageService
  ) { }

  getProducts() {
    let cursor = null,
      filterKeyword = '',
      productTransactionItems = Array<ProductTransaction>();

    this.store
      .select(endCursorSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    this.store
      .select(filterKeywordSelector)
      .pipe(take(1))
      .subscribe(
        (currentFilterKeyword) => (filterKeyword = currentFilterKeyword)
      );

    this.store
      .select(productTransactionsSelector)
      .pipe(take(1))
      .subscribe(
        (productTransactions) => (productTransactionItems = productTransactions)
      );

    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .watchQuery({
        query: GET_PRODUCTS_QUERY,
        variables: {
          cursor,
          filterKeyword,
          userAccountId,
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ products: IBaseConnection }>) => {
          const data = result.data.products;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const productsDto = <Array<Product>>data.nodes;

          const products: Array<Product> = productsDto.map((productDto) => {
            const product = new Product();
            product.id = productDto.id;
            product.code = productDto.code;
            product.name = productDto.name;
            product.description = productDto.description;
            product.stockQuantity = productDto.stockQuantity;
            product.pricePerUnit = productDto.pricePerUnit;
            product.price = productDto.price;
            product.isTransferable = productDto.isTransferable;
            product.numberOfUnits = productDto.numberOfUnits;
            product.productUnit = productDto.productUnit;
            product.deductedStock =
              -productTransactionItems.find(
                (pt) => pt.productId === productDto.id
              )?.quantity | 0;
            return product;
          });

          if (products) {
            return {
              endCursor,
              hasNextPage,
              products,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getProductsByName(productName: string) {
    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .watchQuery({
        query: GET_PRODUCTS_QUERY,
        variables: {
          cursor: null,
          filterKeyword: productName,
          userAccountId,
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ products: IBaseConnection }>) => {
          const data = result.data.products;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const productsDto = <Array<Product>>data.nodes;

          const products: Array<Product> = productsDto.map((productDto) => {
            const product = new Product();
            product.id = productDto.id;
            product.code = productDto.code;
            product.name = productDto.name;
            product.description = productDto.description;
            product.stockQuantity = productDto.stockQuantity;
            product.pricePerUnit = productDto.pricePerUnit;
            product.price = productDto.price;
            product.isTransferable = productDto.isTransferable;
            product.numberOfUnits = productDto.numberOfUnits;
            product.productUnit = productDto.productUnit;
            return product;
          });

          if (products) {
            return {
              endCursor,
              hasNextPage,
              products,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getProduct(productId: number) {
    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .watchQuery({
        query: GET_PRODUCT_STORE,
        variables: {
          productId,
          userAccountId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              product: IProductInformationQueryPayload;
            }>
          ) => {
            const data = result.data.product;

            if (data.typename === 'ProductInformationResult')
              return <ProductInformationResult>result.data.product;
            if (data.typename === 'ProductNotExistsError')
              throw new Error(
                (<ProductNotExistsError>result.data.product).message
              );

            return null;
          }
        )
      );
  }

  updateProductInformation(products: Array<Product>) {

    const productInputs = products.map((product: Product) => {
      return <IProductInput>{
        id: product.id,
        name: product.name,
        code: product.code,
        description: product.description,
        stockQuantity: product.stockQuantity,
        pricePerUnit: product.pricePerUnit,
        isTransferable: product.isTransferable,
        numberOfUnits: product.numberOfUnits,
        withdrawalSlipNo: product.withdrawalSlipNo,
        productUnitInput: {
          id: product.productUnit.id,
          name: product.productUnit.name,
        },
      }
    });

    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .mutate({
        mutation: UPDATE_PRODUCT_MUTATION,
        variables: {
          productInputs,
          userAccountId,
        },
      })
      .pipe(
        map((result: MutationResult<{ updateProducts: IProductOutput }>) => {
          const output = result.data.updateProducts;
          const payload = output.products;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  deleteProduct(productId: number) {
    return this.apollo
      .mutate({
        mutation: DELETE_PRODUCT,
        variables: {
          productId,
        },
      })
      .pipe(
        map((result: MutationResult<{ deleteProduct: IProductOutput }>) => {
          const output = result.data.deleteProduct;
          const payload = output.products;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  checkProductCodeExists(productId: number, productCode: string) {
    return this.apollo
      .watchQuery({
        query: CHECK_PRODUCT_CODE,
        variables: {
          productId,
          productCode,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              checkProductCode: IProductInformationQueryPayload;
            }>
          ) => {
            const data = result.data.checkProductCode;
            if (data.typename === 'CheckProductCodeInformationResult')
              return (<CheckProductCodeInformationResult>(
                result.data.checkProductCode
              )).exists;

            return false;
          }
        )
      );
  }

  validateProductionTransactionsQuantities(
    productTransactions: Array<ProductTransaction>
  ) {
    const productTransactionsInputs = productTransactions.map((p) => {
      return {
        id: p.id,
        productId: p.productId,
        quantity: p.quantity,
        price: p.price,
        currentQuantity: p.currentQuantity,
      };
    });

    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .watchQuery({
        query: VALIDATE_PRODUCT_QUANTITIES,
        variables: {
          productTransactionsInputs,
          userAccountId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              validateProductionTransactionsQuantities: Array<IValidateProductQuantitiesQueryPayload>;
            }>
          ) => {
            const data = <Array<InsufficientProductQuantity>>(
              result.data.validateProductionTransactionsQuantities
            );

            const insufficientProductQuantities: Array<InsufficientProductQuantity> =
              data.map((i) => {
                return <InsufficientProductQuantity>{
                  productId: i.productId,
                  productName: i.productName,
                  productCode: i.productCode,
                  currentQuantity: i.currentQuantity,
                  selectedQuantity: i.selectedQuantity,
                };
              });

            return insufficientProductQuantities;
          }
        )
      );
  }

  analyzeTextOrders(textOrders: string) {
    return this.apollo
      .watchQuery({
        query: ANALYZE_TEXT_ORDERS,
        variables: {
          textOrders,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              analyzeTextOrders: Array<IProductTransactionQueryPayload>;
            }>
          ) => {
            const data = <Array<IProductTransactionQueryPayload>>(
              result.data.analyzeTextOrders
            );

            const productTransactions: Array<ProductTransaction> = data.map(
              (product) => {
                return <ProductTransaction>{
                  code: product.code,
                  productId: product.productId,
                  productName: product.productName,
                  price: product.price,
                  quantity: product.quantity,
                  currentQuantity: product.currentQuantity,
                };
              }
            );

            return productTransactions;
          }
        )
      );
  }

  analyzeTextInventories(textInventories: string) {
    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .watchQuery({
        query: ANALYZE_TEXT_INVENTORIES,
        variables: {
          textInventories,
          userAccountId
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              analyzeTextInventories: Array<ITextProductInventoryQueryPayload>;
            }>
          ) => {
            const data = <Array<ITextProductInventoryQueryPayload>>(
              result.data.analyzeTextInventories
            );

            const products: Array<Product> = data.map(
              (prod) => {
                const product = new Product();
                product.id = prod.id;
                product.name = prod.name;
                product.code = prod.code;
                product.description = prod.description;
                product.stockQuantity = prod.additionalQuantity;
                product.pricePerUnit = prod.price;
                product.price = prod.price;
                product.isTransferable = prod.isTransferable;
                product.numberOfUnits = prod.numberOfUnits;
                product.withdrawalSlipNo = prod.withdrawalSlipNo;
                product.productUnit = prod.productUnit;
                return product;
              }
            );

            return products;
          }
        )
      );
  }

  getSalesAgentsList() {
    return this.apollo
      .watchQuery({
        query: GET_SALES_AGENTS_LIST,
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ salesAgents: Array<User> }>) => {
          const data = result.data.salesAgents;

          const salesAgents: Array<User> = data.map((currentUser: User) => {
            const user = new User();
            user.id = currentUser.id;
            user.firstName = currentUser.firstName;
            user.middleName = currentUser.middleName;
            user.lastName = currentUser.lastName;
            user.username = currentUser.username;
            return user;
          });

          return salesAgents;
        })
      );
  }

  getProductDetailList(userAccountId: number, filterKeyword: string = '') {
    return this.apollo
      .watchQuery({
        query: GET_PRODUCT_DETAILS_LIST,
        variables: {
          userAccountId,
          filterKeyword
        }

      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ productsDetailList: Array<Product> }>) => {
          const data = result.data.productsDetailList;

          const products: Array<Product> = data.map((currentProduct: Product) => {
            const product = new Product();
            product.id = currentProduct.id;
            product.code = currentProduct.code;
            product.name = currentProduct.name;
            product.productUnit = currentProduct.productUnit;
            return product;
          });

          return products;
        })
      );
  }

  getProductStockAuditList(productId: number, userAccountId: number) {
    let cursor = null,
      sortOrder = SortOrderOptionsEnum.ASCENDING,
      stockAuditSource = StockAuditSourceEnum.None,
      fromDate = null,
      toDate = null;

    this.store
      .select(endCursorProductStockAuditSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    this.store
      .select(sortOrderSelector)
      .pipe(take(1))
      .subscribe((currentSortOrder) => (sortOrder = currentSortOrder));

    this.store
      .select(stockAuditSourceSelector)
      .pipe(take(1))
      .subscribe((currentStockAuditSource) => (stockAuditSource = currentStockAuditSource));

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
        query: GET_PRODUCT_STOCK_AUDITS_LIST,
        variables: {
          productId,
          userAccountId,
          cursor,
          sortOrder,
          stockAuditSource,
          fromDate,
          toDate
        }
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ productStockAuditItems: IBaseConnection }>) => {
          const data = result.data.productStockAuditItems;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const productsStockAuditsDto = <Array<ProductStockAuditItem>>data.nodes;

          const productStockAuditItems: Array<ProductStockAuditItem> = productsStockAuditsDto.map((stockAudit: ProductStockAuditItem) => {
            const newStockAuditItem = new ProductStockAuditItem();
            newStockAuditItem.id = stockAudit.id;
            newStockAuditItem.quantity = stockAudit.quantity;
            newStockAuditItem.stockAuditSource = stockAudit.stockAuditSource;
            newStockAuditItem.transactionNumber = stockAudit.transactionNumber;
            newStockAuditItem.modifiedDate = stockAudit.modifiedDate;
            newStockAuditItem.modifiedBy = stockAudit.modifiedBy;
            return newStockAuditItem;
          });

          if (productStockAuditItems) {
            return {
              endCursor,
              hasNextPage,
              productStockAuditItems,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  updateProductStockAudit(productStockAudit: ProductStockAudit) {
    return this.apollo
      .mutate({
        mutation: UPDATE_PRODUCT_STOCK_AUDIT,
        variables: {
          productStockAuditId: productStockAudit.id,
          withdrawalSlipNo: productStockAudit.withdrawalSlipNo,
          newQuantity: productStockAudit.quantity,
        },
      })
      .pipe(
        map((result: MutationResult<{ updateProductStockAudit: IProductStockAuditOutput }>) => {
          const output = result.data.updateProductStockAudit;
          const payload = output.productStockAudit;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  transferProductStockFromOwnInventory(
    userAccountId: number,
    sourceProductId: number,
    destinationProductId: number,
    destinationProductNumberOfUnits: number,
    sourceProductNumberOfUnits: number,
    sourceNumberOfUnitsTransfered: number,
    transferProductStockType: TransferProductStockTypeEnum) {
    return this.apollo
      .mutate({
        mutation: TRANSFER_PRODUCT_STOCK_FROM_OWN_INVENTORY_QUERY,
        variables: {
          userAccountId,
          sourceProductId,
          destinationProductId,
          destinationProductNumberOfUnits,
          sourceProductNumberOfUnits,
          sourceNumberOfUnitsTransfered,
          transferProductStockType
        },
      })
      .pipe(
        map((result: MutationResult<{ transferProductStockFromOwnInventory: IProductOutput }>) => {
          const output = result.data.transferProductStockFromOwnInventory;
          const payload = output.products;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }
}
