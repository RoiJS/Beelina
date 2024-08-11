import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApolloQueryResult } from '@apollo/client/core';
import { Store } from '@ngrx/store';

import { Apollo, gql, MutationResult } from 'apollo-angular';
import { GraphQLError } from 'graphql';
import { catchError, map, take } from 'rxjs';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import { ProductNotExistsError } from '../_models/errors/product-not-exists.error';

import {
  endCursorSelector as endCursorProductSelector,
  filterKeywordSelector as filterKeywordProductSelector,
  supplierIdSelector as supplierIdProductSelector,
} from '../product/store/selectors';
import {
  endCursorSelector as endCursorWarehouseProductSelector,
  filterKeywordSelector as filterKeywordWarehouseProductSelector,
  supplierIdSelector as supplierIdWarehouseProductSelector,
} from '../warehouse/store/selectors';
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
import { BusinessModelEnum } from '../_enum/business-model.enum';
import { TransferProductStockTypeEnum } from '../_enum/transfer-product-stock-type.enum';
import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { ProductStockAuditItem } from '../_models/product-stock-audit-item';
import { StockAuditSourceEnum } from '../_enum/stock-audit-source.enum';
import { getProductSourceEnum, ProductSourceEnum } from '../_enum/product-source.enum';
import { IExtractedProductsFileOutput } from '../_interfaces/outputs/iproduct-import-file.output';

import { environment } from 'src/environments/environment';

const GET_PRODUCT_TOTAL_INVENTORY_VALUE = gql`
query($userAccountId: Int!) {
  inventoryPanelTotalValue(userAccountId: $userAccountId)
}
`;

const GET_PRODUCTS_QUERY = gql`
  query ($userAccountId: Int!, $cursor: String, $filterKeyword: String, $productsFilter: ProductsFilterInput!) {
    products(
      userAccountId: $userAccountId
      after: $cursor
      filterKeyword: $filterKeyword,
      productsFilter: $productsFilter
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
        supplierId
        isLinkedToSalesAgent
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
      totalCount
    }
  }
`;

const GET_WAREHOUSE_PRODUCTS_QUERY = gql`
  query ($warehouseId: Int!, $cursor: String, $filterKeyword: String, $productsFilter: ProductsFilterInput!) {
    warehouseProducts(
      warehouseId: $warehouseId,
      after: $cursor,
      filterKeyword: $filterKeyword,
      productsFilter: $productsFilter
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
        supplierId
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
      totalCount
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
        defaultPrice
        stocksRemainingFromWarehouse
        stockQuantity
        pricePerUnit
        price
        numberOfUnits
        isTransferable
        supplierId
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

const GET_WAREHOUSE_PRODUCT_STORE = gql`
  query ($productId: Int!, $warehouseId: Int!) {
    warehouseProduct(productId: $productId, warehouseId: $warehouseId) {
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
        supplierId
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

const UPDATE_PRODUCT_QUERY = gql`
  query($productInputs: [ProductInput!]!, $userAccountId: Int!) {
    updateProducts(productInputs: $productInputs, userAccountId:  $userAccountId){
      id
      code
      name
    }
  }
`;

const UPDATE_WAREHOUSE_PRODUCT_QUERY = gql`
query($productInputs: [ProductInput!]!, $warehouseId: Int!) {
  updateWarehouseProducts(productInputs: $productInputs, warehouseId:  $warehouseId ){
    id
    code
    name
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

const CHECK_WAREHOUSE_PRODUCT_QUANTITY = gql`
  query ($productId: Int!, $warehouseId: Int!, $quantity: Int!) {
    checkWarehouseProductStockQuantity(productId: $productId, warehouseId: $warehouseId, quantity: $quantity) {
      productId,
      productName,
      selectedQuantity,
      currentQuantity
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

const GET_WAREHOUSE_PRODUCT_STOCK_AUDITS_LIST = gql`
  query (
    $productId: Int!,
    $warehouseId: Int!,
    $stockAuditSource: StockAuditSourceEnum!,
    $sortOrder: SortEnumType
    $fromDate: String,
    $toDate: String,
    $cursor: String) {
      warehouseProductStockAuditItems(
        after: $cursor
        order: [{ modifiedDate: $sortOrder }]
        stockAuditSource: $stockAuditSource,
        productId: $productId,
        warehouseId: $warehouseId,
        fromDate: $fromDate,
        toDate: $toDate) {
      nodes {
        id
        quantity
        transactionNumber
        plateNo
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
    $transferProductStockType: TransferProductStockTypeEnum!,
    $productSource: ProductSourceEnum!
  ) {
    transferProductStockFromOwnInventory(input: {
      userAccountId: $userAccountId,
      sourceProductId:  $sourceProductId,
      destinationProductId:  $destinationProductId,
      destinationProductNumberOfUnits: $destinationProductNumberOfUnits,
      sourceProductNumberOfUnits:  $sourceProductNumberOfUnits,
      sourceNumberOfUnitsTransfered:  $sourceNumberOfUnitsTransfered,
      transferProductStockType: $transferProductStockType,
      productSource: $productSource
    }){
      product {
          name
      }
    }
  }
`;

const EXTRACT_PRODUCT_FILE_QUERY = `
  mutation ($warehouseId: Int!, $file: Upload!) {
    extractProductsFile(input: { warehouseId: $warehouseId, file: $file }) {
      errors {
          __typename
          ... on ExtractedProductsFileError {
              message
          }
          ... on BaseError {
              message
          }
      }
      mapExtractedProductResult {
        successExtractedProducts {
          id
          code
          name
          supplierCode
          supplierId
          description
          isTransferable
          originalName
          unit
          price
          numberOfUnits
          quantity
          originalUnit
          originalPrice
          originalNumberOfUnits
          originalSupplierCode
          originalSupplierId
        }
        failedExtractedProducts {
          rowNumber
          message
        }
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _warehouseId: number = 1;

  constructor(
    private apollo: Apollo,
    private http: HttpClient,
    private store: Store<AppStateInterface>,
    private storageService: StorageService
  ) { }

  getProducts() {
    let cursor = null,
      filterKeyword = '',
      supplierId = 0,
      productTransactionItems = Array<ProductTransaction>();

    this.store
      .select(endCursorProductSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    this.store
      .select(filterKeywordProductSelector)
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

    this.store
      .select(supplierIdProductSelector)
      .pipe(take(1))
      .subscribe(
        (currentSupplierId) => (supplierId = currentSupplierId)
      );

    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .watchQuery({
        query: GET_PRODUCTS_QUERY,
        variables: {
          cursor,
          filterKeyword,
          userAccountId,
          productsFilter: {
            supplierId
          }
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ products: IBaseConnection }>) => {
          const data = result.data.products;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const totalCount = data.totalCount;
          const productsDto = <Array<Product>>data.nodes;

          const products: Array<Product> = productsDto.map((productDto) => {
            const product = new Product();
            product.id = productDto.id;
            product.code = productDto.code;
            product.name = productDto.name;
            product.description = productDto.description;
            product.stockQuantity = productDto.stockQuantity;
            product.pricePerUnit = productDto.pricePerUnit;
            product.supplierId = productDto.supplierId;
            product.price = productDto.price;
            product.isTransferable = productDto.isTransferable;
            product.numberOfUnits = productDto.numberOfUnits;
            product.productUnit = productDto.productUnit;
            product.isLinkedToSalesAgent = productDto.isLinkedToSalesAgent;
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
              totalCount
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getWarehouseProducts() {
    let cursor = null,
      supplierId = 0,
      filterKeyword = '';

    this.store
      .select(endCursorWarehouseProductSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    this.store
      .select(filterKeywordWarehouseProductSelector)
      .pipe(take(1))
      .subscribe(
        (currentFilterKeyword) => (filterKeyword = currentFilterKeyword)
      );

    this.store
      .select(supplierIdWarehouseProductSelector)
      .pipe(take(1))
      .subscribe(
        (currentSupplierId) => (supplierId = currentSupplierId)
      );

    const warehouseId = this._warehouseId;

    return this.apollo
      .watchQuery({
        query: GET_WAREHOUSE_PRODUCTS_QUERY,
        variables: {
          cursor,
          filterKeyword,
          warehouseId,
          productsFilter: {
            supplierId
          }
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ warehouseProducts: IBaseConnection }>) => {
          const data = result.data.warehouseProducts;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const totalCount = data.totalCount;
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
            product.supplierId = productDto.supplierId;
            product.isLinkedToSalesAgent = false;
            return product;
          });

          if (products) {
            return {
              endCursor,
              hasNextPage,
              products,
              totalCount
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getProductsByName(productName: string, productSource: ProductSourceEnum, businessModel: BusinessModelEnum) {
    let query = null;
    let variables = {};

    const parseProducts = (productsDto: Array<Product>, endCursor: string, hasNextPage: boolean, errors: Array<GraphQLError>) => {
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
    }

    if (productSource === ProductSourceEnum.Panel && businessModel === BusinessModelEnum.WarehousePanelMonitoring) {
      query = GET_PRODUCTS_QUERY;
      variables = {
        cursor: null,
        filterKeyword: productName,
        userAccountId: +this.storageService.getString('currentSalesAgentId'),
        productsFilter: {
          supplierId: 0
        }
      };

      return this.apollo
        .watchQuery({
          query,
          variables,
        })
        .valueChanges.pipe(
          map((result: ApolloQueryResult<{ products: IBaseConnection }>) => {
            const data = result.data.products;
            const productsDto = <Array<Product>>data.nodes;

            const errors = <Array<GraphQLError>>result.errors;
            const endCursor = data.pageInfo.endCursor;
            const hasNextPage = data.pageInfo.hasNextPage;

            return parseProducts(productsDto, endCursor, hasNextPage, errors);
          })
        );
    } else {
      query = GET_WAREHOUSE_PRODUCTS_QUERY;
      variables = {
        cursor: null,
        filterKeyword: productName,
        warehouseId: 1,
        productsFilter: {
          supplierId: 0
        }
      };

      return this.apollo
        .watchQuery({
          query,
          variables,
        })
        .valueChanges.pipe(
          map((result: ApolloQueryResult<{ warehouseProducts: IBaseConnection }>) => {
            const data = result.data.warehouseProducts;
            const productsDto = <Array<Product>>data.nodes;

            const errors = <Array<GraphQLError>>result.errors;
            const endCursor = data.pageInfo.endCursor;
            const hasNextPage = data.pageInfo.hasNextPage;

            return parseProducts(productsDto, endCursor, hasNextPage, errors);
          })
        );
    }
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

  getWarehouseProduct(productId: number) {
    const warehouseId = this._warehouseId;
    return this.apollo
      .watchQuery({
        query: GET_WAREHOUSE_PRODUCT_STORE,
        variables: {
          productId,
          warehouseId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              warehouseProduct: IProductInformationQueryPayload;
            }>
          ) => {
            const data = result.data.warehouseProduct;

            if (data.typename === 'ProductInformationResult')
              return <ProductInformationResult>result.data.warehouseProduct;
            if (data.typename === 'ProductNotExistsError')
              throw new Error(
                (<ProductNotExistsError>result.data.warehouseProduct).message
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
        supplierId: product.supplierId,
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
      .watchQuery({
        query: UPDATE_PRODUCT_QUERY,
        variables: {
          productInputs,
          userAccountId,
        },
      })
      .valueChanges
      .pipe(
        map((result: ApolloQueryResult<{ products: Array<Product> }>) => {
          const output = result.data;
          const payload = output.products;

          if (payload) {
            return payload;
          }

          return null;
        }),
        catchError((error) => { throw new Error(error); })
      );
  }

  updateWarehouseProductInformation(products: Array<Product>) {
    const productInputs = products.map((product: Product) => {
      return <IProductInput>{
        id: product.id,
        name: product.name,
        code: product.code,
        description: product.description,
        supplierId: product.supplierId,
        stockQuantity: product.stockQuantity,
        pricePerUnit: product.pricePerUnit,
        isTransferable: product.isTransferable,
        numberOfUnits: product.numberOfUnits,
        withdrawalSlipNo: product.withdrawalSlipNo,
        plateNo: product.plateNo,
        productUnitInput: {
          id: product.productUnit.id,
          name: product.productUnit.name,
        },
      }
    });

    const warehouseId = this._warehouseId;

    return this.apollo
      .watchQuery({
        query: UPDATE_WAREHOUSE_PRODUCT_QUERY,
        variables: {
          productInputs,
          warehouseId,
        },
      })
      .valueChanges
      .pipe(
        map((result: ApolloQueryResult<{ updateWarehouseProducts: Array<Product> }>) => {
          const output = result.data;
          const payload = output.updateWarehouseProducts;

          if (payload) {
            return payload;
          }

          return null;
        }),
        catchError((error) => { throw new Error(error); })
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

  checkWarehouseProductStockQuantity(
    productId: number,
    warehouseId: number,
    quantity: number,
  ) {
    return this.apollo
      .watchQuery({
        query: CHECK_WAREHOUSE_PRODUCT_QUANTITY,
        variables: {
          productId,
          warehouseId,
          quantity,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              checkWarehouseProductStockQuantity: Array<IValidateProductQuantitiesQueryPayload>;
            }>
          ) => {
            const data = <Array<InsufficientProductQuantity>>(
              result.data.checkWarehouseProductStockQuantity
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

  getWarehouseProductStockAuditList(productId: number, warehouseId: number) {
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
        query: GET_WAREHOUSE_PRODUCT_STOCK_AUDITS_LIST,
        variables: {
          productId,
          warehouseId,
          cursor,
          sortOrder,
          stockAuditSource,
          fromDate,
          toDate
        }
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ warehouseProductStockAuditItems: IBaseConnection }>) => {
          const data = result.data.warehouseProductStockAuditItems;
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
            newStockAuditItem.plateNo = stockAudit.plateNo;
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
    transferProductStockType: TransferProductStockTypeEnum,
    productSource: ProductSourceEnum,
  ) {
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
          transferProductStockType,
          productSource: getProductSourceEnum(productSource)
        }
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

  extractProductsFile(
    warehouseId: number,
    file: File) {

    var fd = new FormData();
    var operations = {
      query: EXTRACT_PRODUCT_FILE_QUERY,
      variables: {
        file: null,
        warehouseId
      }
    }
    var _map = {
      file: ["variables.file"]
    }
    fd.append('operations', JSON.stringify(operations))
    fd.append('map', JSON.stringify(_map))
    fd.append('file', file, file.name)

    const headers = new HttpHeaders().set('GraphQL-preflight', '1');

    return this.http.post<IExtractedProductsFileOutput>(environment.beelinaAPIEndPoint, fd, { headers })
      .pipe(
        map((result: IExtractedProductsFileOutput) => {
          const data = result.data;
          const output = data.extractProductsFile.mapExtractedProductResult;
          const errors = data.extractProductsFile.errors;

          if (output && output.successExtractedProducts && output.failedExtractedProducts) {
            return {
              successExtractedProducts: output.successExtractedProducts,
              failedExtractedProducts: output.failedExtractedProducts
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getPanelInventoryTotalValue() {
    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .watchQuery({
        query: GET_PRODUCT_TOTAL_INVENTORY_VALUE,
        variables: {
          userAccountId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              inventoryPanelTotalValue: number;
            }>
          ) => {
            const data = result.data.inventoryPanelTotalValue;
            return data;
          }
        )
      );
  }
}
