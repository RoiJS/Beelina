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
  endCursorSelector as endCursorProductStockAuditSelector,
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
import { User } from '../_models/user.model';
import { StorageService } from './storage.service';
import { ProductStockAudit } from '../_models/product-stock-audit';
import { IProductStockAuditOutput } from '../_interfaces/outputs/iproduct-stock-update.output';
import { TransferProductStockTypeEnum } from '../_enum/transfer-product-stock-type.enum';

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
  mutation ($productInput: ProductInput!, $userAccountId: Int!) {
    updateProduct(
      input: { productInput: $productInput, userAccountId: $userAccountId }
    ) {
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
  query ($userAccountId: Int!) {
    productsDetailList(
      userAccountId: $userAccountId
    ) {
        id
        name
        code
    }
  }
`;

const GET_PRODUCT_STOCK_AUDITS_LIST = gql`
  query ($productId: Int!, $userAccountId: Int!, $cursor: String) {
    productStockAudits(productId: $productId, userAccountId: $userAccountId, after: $cursor ) {
      nodes {
        id
        withdrawalSlipNo
        quantity
        dateCreated
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

  updateProductInformation(product: Product) {
    const productInput: IProductInput = {
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
    };

    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .mutate({
        mutation: UPDATE_PRODUCT_MUTATION,
        variables: {
          productInput,
          userAccountId,
        },
      })
      .pipe(
        map((result: MutationResult<{ updateProduct: IProductOutput }>) => {
          const output = result.data.updateProduct;
          const payload = output.product;
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
          const payload = output.product;
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

  getProductDetailList(userAccountId: number) {
    return this.apollo
      .watchQuery({
        query: GET_PRODUCT_DETAILS_LIST,
        variables: {
          userAccountId
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
            return product;
          });

          return products;
        })
      );
  }

  getProductStockAuditList(productId: number, userAccountId: number) {
    let cursor = null;

    this.store
      .select(endCursorProductStockAuditSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    return this.apollo
      .watchQuery({
        query: GET_PRODUCT_STOCK_AUDITS_LIST,
        variables: {
          productId,
          userAccountId,
          cursor
        }
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ productStockAudits: IBaseConnection }>) => {
          const data = result.data.productStockAudits;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const productsStockAuditsDto = <Array<ProductStockAudit>>data.nodes;

          const productStockAudits: Array<ProductStockAudit> = productsStockAuditsDto.map((stockAudit: ProductStockAudit) => {
            const newStockAudit = new ProductStockAudit();
            newStockAudit.id = stockAudit.id;
            newStockAudit.quantity = stockAudit.quantity;
            newStockAudit.withdrawalSlipNo = stockAudit.withdrawalSlipNo;
            newStockAudit.dateCreated = stockAudit.dateCreated;
            return newStockAudit;
          });

          if (productStockAudits) {
            return {
              endCursor,
              hasNextPage,
              productStockAudits,
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
          const payload = output.product;
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
