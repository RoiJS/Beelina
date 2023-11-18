import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Store } from '@ngrx/store';

import { Apollo, gql, MutationResult } from 'apollo-angular';
import { delay, map, take } from 'rxjs';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import { ProductNotExistsError } from '../_models/errors/product-not-exists.error';

import {
  endCursorSelector,
  filterKeywordSelector,
} from '../product/store/selectors';
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

const GET_PRODUCTS_METHODS = gql`
  query ($userAccountId: Int!, $cursor: String, $filterKeyword: String) {
    products(
      userAccountId: $userAccountId
      after: $cursor
      where: {
        or: [
          { name: { contains: $filterKeyword } }
          { code: { contains: $filterKeyword } }
        ]
      }
    ) {
      edges {
        cursor
        node {
          name
          code
          description
          stockQuantity
          pricePerUnit
          productUnit {
            id
            name
          }
        }
      }
      nodes {
        id
        name
        code
        description
        stockQuantity
        pricePerUnit
        price
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

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(
    private apollo: Apollo,
    private store: Store<AppStateInterface>,
    private storageService: StorageService
  ) {}

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
        query: GET_PRODUCTS_METHODS,
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
        delay(1000),
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
}
