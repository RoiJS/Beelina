import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApolloQueryResult } from '@apollo/client/core';
import { Store } from '@ngrx/store';

import { Apollo, gql, MutationResult } from 'apollo-angular';
import { GraphQLError } from 'graphql';
import { catchError, map, take } from 'rxjs';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import { ProductNotExistsError } from '../_models/errors/product-not-exists.error';

import {
  endCursorSelector as endCursorProductStockAuditSelector, fromDateSelector, sortOrderSelector, stockAuditSourceSelector, toDateSelector,
} from '../product/edit-product-details/manage-product-stock-audit/store/selectors';

import { CheckProductCodeInformationResult } from '../_models/results/check-product-code-information-result';
import { ProductInformationResult } from '../_models/results/product-information-result';

import { IBaseConnection } from '../_interfaces/connections/ibase.connection';
import { IProductInput } from '../_interfaces/inputs/iproduct.input';
import { IProductOutput } from '../_interfaces/outputs/iproduct.output';
import { Product } from '../_models/product';
import { ProductTransaction } from '../_models/transaction';
import { InsufficientProductQuantity, InvalidProductTransactionOverallQuantitiesTransactions } from '../_models/insufficient-product-quantity';

import { IValidateProductQuantitiesQueryPayload } from '../_interfaces/payloads/ivalidate-product-quantities-query.payload';
import { IProductInformationQueryPayload } from '../_interfaces/payloads/iproduct-information-query.payload';
import { IProductTransactionQueryPayload } from '../_interfaces/payloads/iproduct-transaction-query.payload';
import { ITextProductInventoryQueryPayload } from '../_interfaces/payloads/itext-product-inventory-query.payload';

import { StorageService } from './storage.service';

import { User } from '../_models/user.model';
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
import { TransactionDto } from './transaction.service';
import { ITransactionInput } from '../_interfaces/inputs/itransaction.input';
import { IProductTransactionInput } from '../_interfaces/inputs/iproduct-transaction.input';
import { ProductWarehouseStockReceiptEntry } from '../_models/product-warehouse-stock-receipt-entry';
import { IProductWarehouseStockReceiptEntryInput } from '../_interfaces/inputs/iproduct-warehouse-stock-receipt-entry.input';
import { IProductStockWarehouseAuditInput } from '../_interfaces/inputs/iproduct-stock-warehouse-audit.input';
import { IProductWarehouseStockReceiptEntryPayload } from '../_interfaces/payloads/iproduct-warehouse-stock-receipt-entry-query.payload';
import { ProductWarehouseStockReceiptEntryNotExistsError } from '../_models/errors/product-warehouse-stock-receipt-entry-not-exists.error';
import { CheckPurchaseOrderCodeInformationResult } from '../_models/results/check-purchase-order-code-information-result';
import { ProductWarehouseStockReceiptEntryResult } from '../_models/results/product-warehouse-stock-receipt-entry-result';
import { IStockReceiptEntryOutput } from '../_interfaces/outputs/istock-receipt-entry.output';

const GET_PRODUCT_TOTAL_INVENTORY_VALUE = gql`
  query($userAccountId: Int!) {
    inventoryPanelTotalValue(userAccountId: $userAccountId)
  }
`;

const GET_PRODUCTS_QUERY = gql`
  query ($userAccountId: Int!, $cursor: String, $filterKeyword: String, $productsFilter: ProductsFilterInput!, $limit: Int!) {
    products(
      userAccountId: $userAccountId
      after: $cursor
      filterKeyword: $filterKeyword,
      productsFilter: $productsFilter,
      first: $limit
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
  query ($warehouseId: Int!, $cursor: String, $filterKeyword: String, $limit: Int!, $productsFilter: ProductsFilterInput!) {
    warehouseProducts(
      warehouseId: $warehouseId,
      after: $cursor,
      filterKeyword: $filterKeyword,
      productsFilter: $productsFilter,
      first: $limit
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

const GET_PRODUCT_WAREHOUSE_STOCK_ENTRY_RECEIPT = gql`
  query($id: Int!) {
    productWarehouseStockReceiptEntry(id: $id){
      typename: __typename
      ... on ProductWarehouseStockReceiptEntryResult {
          id
          referenceNo
          stockEntryDate
          referenceNo
          supplierId
          notes
          plateNo
          productStockWarehouseAuditsResult {
              id
              productId
              productStockPerWarehouseId
              productWarehouseStockReceiptEntryId
              stockAuditSource
              quantity
          }
      }

      ... on ProductWarehouseStockReceiptEntryNotExistsError {
          message
      }
    }
  }
`;

const GET_PRODUCT_WAREHOUSE_STOCK_RECEIPT_ENTRIES_QUERY = gql`
  query(
    $filterKeyword: String,
    $productReceiptEntryFilter: ProductReceiptEntryFilterInput!,
    $skip: Int!,
    $take: Int!,
    $order: [ProductWarehouseStockReceiptEntrySortInput!]) {
      productWarehouseStockReceiptEntries(
            filterKeyword: $filterKeyword,
            productReceiptEntryFilter: $productReceiptEntryFilter,
            order: $order,
            skip: $skip,
            take: $take
        ) {
            items {
                id
                supplierId
                supplier {
                    name
                }
                stockEntryDate
                referenceNo
                plateNo
                warehouseId
                notes
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
            }
            totalCount
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
      supplierId
    }
  }
`;

const UPDATE_PRODUCT_WAREHOUSE_STOCK_RECEIPT_ENTRIES_QUERY = gql`
  query($productWarehouseStockReceiptEntryInputs: [ProductWarehouseStockReceiptEntryInput!]!) {
    updateWarehouseStockReceiptEntries(productWarehouseStockReceiptEntryInputs: $productWarehouseStockReceiptEntryInputs){
      id
      referenceNo
      stockEntryDate
      referenceNo
      supplierId
      productStockWarehouseAudits {
          id
          productStockPerWarehouseId
          productWarehouseStockReceiptEntryId
          stockAuditSource
          quantity
      }
    }
  }
`;

const DELETE_PRODUCT_WAREHOUSE_STOCK_RECEIPT_ENTRY_QUERY = gql`
  mutation($stockEntryReceiptId: Int!) {
    deleteWarehouseStockReceiptEntry(input: { stockEntryReceiptId: $stockEntryReceiptId}) {
      productWarehouseStockReceiptEntry {
        id
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

const CHECK_PURCHASE_ORDER_CODE = gql`
  query($purchaseOrderId: Int!, $referenceCode: String!){
    checkPurchaseOrderCode(purchaseOrderId: $purchaseOrderId, referenceCode: $referenceCode) {
      typename: __typename
      ... on CheckPurchaseOrderCodeInformationResult {
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
  query ($userAccountId: Int!, $transactionInputs: [TransactionInput!]!) {
    validateProductionTransactionsQuantities(transactionInputs: $transactionInputs, userAccountId: $userAccountId) {
      transactionCode
      transactionId
      invalidProductTransactionOverallQuantities {
        productId
        productCode
        productName
        overallQuantity
        currentQuantity
      }
    }
  }
`;

const VALIDATE_MULTIPLE_TRANSACTIONS_PRODUCT_QUANTITIES = gql`
  query ($userAccountId: Int!, $transactionIds: [Int!]!) {
    validateMutlipleTransactionsProductQuantities(transactionIds: $transactionIds, userAccountId: $userAccountId) {
        transactionCode
        transactionId
        invalidProductTransactionOverallQuantities {
          productId
          productCode
          productName
          overallQuantity
          currentQuantity
      }
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

  apollo = inject(Apollo);
  http = inject(HttpClient);
  store = inject(Store<AppStateInterface>);
  storageService = inject(StorageService);

  getProducts(cursor: string, filterKeyword: string, supplierId: number, limit: number, productTransactionItems: Array<ProductTransaction>) {

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
          },
          limit
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

  getWarehouseProducts(cursor: string, supplierId: number, filterKeyword: string, limit: number) {
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
          },
          limit
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
        },
        limit: 50
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
        },
        limit: 50
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

  getProductWarehouseStockReceiptEntry(id: number) {
    return this.apollo
      .watchQuery({
        query: GET_PRODUCT_WAREHOUSE_STOCK_ENTRY_RECEIPT,
        variables: {
          id,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              productWarehouseStockReceiptEntry: IProductWarehouseStockReceiptEntryPayload;
            }>
          ) => {
            const data = result.data.productWarehouseStockReceiptEntry;

            if (data.typename === 'ProductWarehouseStockReceiptEntryResult')
              return <ProductWarehouseStockReceiptEntryResult>result.data.productWarehouseStockReceiptEntry;
            if (data.typename === 'ProductWarehouseStockReceiptEntryNotExistsError')
              throw new Error(
                (<ProductWarehouseStockReceiptEntryNotExistsError>result.data.productWarehouseStockReceiptEntry).message
              );

            return null;
          }
        )
      );
  }

  getProductWarehouseStockReceiptEntries(filterKeyword: string, supplierId: number, dateFrom: string, dateTo: string, skip: number, take: number, sortField: string, sortDirection: SortOrderOptionsEnum) {

    let order: any = {
      [sortField]: sortDirection
    };

    if (sortField === "supplierName") {
      order = {
        supplier: {
          name: sortDirection
        }
      };
    }

    return this.apollo
      .watchQuery({
        query: GET_PRODUCT_WAREHOUSE_STOCK_RECEIPT_ENTRIES_QUERY,
        variables: {
          filterKeyword,
          productReceiptEntryFilter: {
            warehouseId: 1,
            supplierId,
            dateFrom,
            dateTo
          },
          skip,
          take,
          order
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ productWarehouseStockReceiptEntries: IBaseConnection }>) => {
          const data = result.data.productWarehouseStockReceiptEntries;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const totalCount = data.totalCount;
          const productWarehouseStockReceiptEntriesDto = <Array<ProductWarehouseStockReceiptEntry>>data.items;

          const productWarehouseStockReceiptEntries: Array<ProductWarehouseStockReceiptEntry> = productWarehouseStockReceiptEntriesDto.map((productWarehouseStockReceiptEntryDto) => {
            const productWarehouseStockReceiptEntry = new ProductWarehouseStockReceiptEntry();
            productWarehouseStockReceiptEntry.id = productWarehouseStockReceiptEntryDto.id;
            productWarehouseStockReceiptEntry.supplierId = productWarehouseStockReceiptEntryDto.supplierId;
            productWarehouseStockReceiptEntry.supplier = productWarehouseStockReceiptEntryDto.supplier;
            productWarehouseStockReceiptEntry.stockEntryDate = productWarehouseStockReceiptEntryDto.stockEntryDate;
            productWarehouseStockReceiptEntry.referenceNo = productWarehouseStockReceiptEntryDto.referenceNo;
            productWarehouseStockReceiptEntry.plateNo = productWarehouseStockReceiptEntryDto.plateNo;
            productWarehouseStockReceiptEntry.warehouseId = productWarehouseStockReceiptEntryDto.warehouseId;
            productWarehouseStockReceiptEntry.notes = productWarehouseStockReceiptEntryDto.notes;
            return productWarehouseStockReceiptEntry;
          });

          if (productWarehouseStockReceiptEntries) {
            return {
              endCursor,
              hasNextPage,
              productWarehouseStockReceiptEntries,
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

  updateWarehouseStockReceiptEntries(productWarehouseStockReceiptEntry: Array<ProductWarehouseStockReceiptEntry>) {

    const productWarehouseStockReceiptEntryInputs = productWarehouseStockReceiptEntry.map((p) => {
      const productWarehouseStockReceiptEntryInput: IProductWarehouseStockReceiptEntryInput = {
        id: p.id,
        supplierId: p.supplierId,
        stockEntryDate: p.stockEntryDate,
        referenceNo: p.referenceNo,
        plateNo: p.plateNo,
        notes: p.notes,
        warehouseId: this._warehouseId,
        productStockWarehouseAudits: p.productStockWarehouseAudits.map((a) => {
          const productStockWarehousAudit: IProductStockWarehouseAuditInput = {
            id: a.id,
            productId: a.productId,
            pricePerUnit: a.pricePerUnit,
            quantity: a.quantity,
            stockAuditSource: a.stockAuditSource
          };

          return productStockWarehousAudit;
        }),
      };

      return productWarehouseStockReceiptEntryInput;
    });

    return this.apollo
      .watchQuery({
        query: UPDATE_PRODUCT_WAREHOUSE_STOCK_RECEIPT_ENTRIES_QUERY,
        variables: {
          productWarehouseStockReceiptEntryInputs,
        },
      })
      .valueChanges
      .pipe(
        map((result: ApolloQueryResult<{ updateWarehouseStockReceiptEntry: ProductWarehouseStockReceiptEntry }>) => {
          const output = result.data;
          const payload = output.updateWarehouseStockReceiptEntry;

          if (payload) {
            return payload;
          }

          return null;
        }),
        catchError((error) => { throw new Error(error); })
      );
  }

  deleteWarehouseStockReceiptEntry(stockEntryReceiptId: number) {
    return this.apollo
      .mutate({
        mutation: DELETE_PRODUCT_WAREHOUSE_STOCK_RECEIPT_ENTRY_QUERY,
        variables: {
          stockEntryReceiptId,
        },
      })
      .pipe(
        map((result: MutationResult<{ deleteWarehouseStockReceiptEntry: IStockReceiptEntryOutput }>) => {
          const output = result.data.deleteWarehouseStockReceiptEntry;
          const payload = output.productWarehouseStockReceiptEntry;
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

  checkPurchaseOrderCodeExists(purchaseOrderId: number, referenceCode: string) {
    return this.apollo
      .watchQuery({
        query: CHECK_PURCHASE_ORDER_CODE,
        variables: {
          purchaseOrderId,
          referenceCode,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              checkPurchaseOrderCode: IProductWarehouseStockReceiptEntryPayload;
            }>
          ) => {
            const data = result.data.checkPurchaseOrderCode;
            if (data.typename === 'CheckPurchaseOrderCodeInformationResult')
              return (<CheckPurchaseOrderCodeInformationResult>(
                result.data.checkPurchaseOrderCode
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

  validateProductionTransactionsQuantities(transactions: Array<TransactionDto>) {
    const transactionInputs: Array<ITransactionInput> = transactions.map((transaction) => {
      const transactionInput: ITransactionInput = {
        id: transaction.id,
        invoiceNo: transaction.invoiceNo,
        discount: transaction.discount,
        storeId: transaction.storeId,
        modeOfPayment: transaction.modeOfPayment,
        paid: transaction.paid,
        status: transaction.status,
        transactionDate: transaction.transactionDate,
        dueDate: transaction.dueDate,
        productTransactionInputs: transaction.productTransactions.map((p) => {
          const productTransaction: IProductTransactionInput = {
            id: p.id,
            productId: p.productId,
            quantity: p.quantity,
            price: p.price,
            currentQuantity: p.currentQuantity,
          };

          return productTransaction;
        })
      };

      return transactionInput;
    });

    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    return this.apollo
      .watchQuery({
        query: VALIDATE_PRODUCT_QUANTITIES,
        variables: {
          transactionInputs,
          userAccountId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              validateProductionTransactionsQuantities: Array<InvalidProductTransactionOverallQuantitiesTransactions>;
            }>
          ) => {
            const data = <Array<InvalidProductTransactionOverallQuantitiesTransactions>>(
              result.data.validateProductionTransactionsQuantities
            );

            const productsWithInsufficientQuantities: Array<InvalidProductTransactionOverallQuantitiesTransactions> =
              data.map((i) => {
                return <InvalidProductTransactionOverallQuantitiesTransactions>{
                  transactionId: i.transactionId,
                  transactionCode: i.transactionCode,
                  invalidProductTransactionOverallQuantities: i.invalidProductTransactionOverallQuantities
                };
              });

            return productsWithInsufficientQuantities;
          }
        )
      );
  }

  validateMultipleTransactionsProductQuantities(transactionIds: Array<number>) {
    const userAccountId = +this.storageService.getString('currentSalesAgentId');
    return this.apollo
      .watchQuery({
        query: VALIDATE_MULTIPLE_TRANSACTIONS_PRODUCT_QUANTITIES,
        variables: {
          transactionIds,
          userAccountId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              validateMutlipleTransactionsProductQuantities: Array<InvalidProductTransactionOverallQuantitiesTransactions>;
            }>
          ) => {
            const data = <Array<InvalidProductTransactionOverallQuantitiesTransactions>>(
              result.data.validateMutlipleTransactionsProductQuantities
            );

            const productsWithInsufficientQuantities: Array<InvalidProductTransactionOverallQuantitiesTransactions> =
              data.map((i) => {
                return <InvalidProductTransactionOverallQuantitiesTransactions>{
                  transactionId: i.transactionId,
                  transactionCode: i.transactionCode,
                  invalidProductTransactionOverallQuantities: i.invalidProductTransactionOverallQuantities
                };
              });

            return productsWithInsufficientQuantities;
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
