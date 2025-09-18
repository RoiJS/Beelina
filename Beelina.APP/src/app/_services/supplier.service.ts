import { Injectable, inject } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';

import { Apollo, MutationResult, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

import { IBaseConnection } from '../_interfaces/connections/ibase.connection';

import { ISupplierInput } from '../_interfaces/inputs/isupplier.input';
import { Supplier } from '../_models/supplier';
import { ISupplierOutput } from '../_interfaces/outputs/isupplier.output';
import { ISupplierInformationQueryPayload } from '../_interfaces/payloads/isupplier-information-query.payload';
import { CheckSupplierCodeInformationResult } from '../_models/results/check-supplier-code-information-result';
import { TopSupplierBySales } from '../_models/top-supplier-by-sales';
import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';

const UPDATE_SUPPLIER_MUTATION = gql`
  mutation($supplierInput: SupplierInput!) {
    updateSupplier(input: { supplierInput: $supplierInput}) {
        supplier {
            id
            name
            isDeletable
        }
    }
  }
`;

const GET_SUPPLIERS = gql`
  query ($filterKeyword: String, $cursor: String){
    suppliers (filterKeyword: $filterKeyword, after: $cursor) {
        nodes {
          id
          name
          code
          isDeletable
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

const GET_ALL_SUPPLIERS = gql`
  query {
    allSuppliers {
      id
      name
      code
    }
  }
`;

const DELETE_SUPPLIERS_MUTATION = gql`
  mutation($supplierIds: [Int!]!) {
    deleteSuppliers(input: { supplierIds: $supplierIds}) {
        boolean
        errors {
          __typename
          ... on SupplierNotExistsError {
              message
          }
          ... on BaseError {
              message
        }
      }
    }
  }
`;

const CHECK_SUPPLIER_CODE = gql`
  query($supplierId: Int!, $supplierCode: String!){
    checkSupplierCode(supplierId: $supplierId, supplierCode: $supplierCode) {
      typename: __typename
      ... on CheckSupplierCodeInformationResult {
        exists
      }
    }
  }
`;

const GET_TOP_SUPPLIERS_BY_SALES = gql`
  query($fromDate: String, $toDate: String, $cursor: String, $sortOrder: SortEnumType!) {
    topSuppliersBySales(
      fromDate: $fromDate,
      toDate: $toDate,
      after: $cursor,
      order: [{totalSalesAmount : $sortOrder }]
    ) {
     nodes {
        supplierId
        supplierName
        supplierCode
        totalSalesAmount
        totalProductsSold
        totalTransactions
        totalSalesAmountFormatted
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

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private _cachedSuppliers: ReadonlyArray<Supplier> | null = null;

  apollo = inject(Apollo);

  get cachedSuppliers(): ReadonlyArray<Supplier> | null {
    // Return a shallow copy to prevent external mutation
    return this._cachedSuppliers ? [...this._cachedSuppliers] : null;
  }

  /**
   * Invalidates the suppliers cache to prevent stale data across sessions/tenants
   */
  invalidateSuppliersCache(): void {
    this._cachedSuppliers = null;
  }

  constructor() { }

  getSuppliers(cursor: string, filterKeyword: string) {
    return this.apollo
      .watchQuery({
        query: GET_SUPPLIERS,
        variables: {
          cursor,
          filterKeyword,
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ suppliers: IBaseConnection }>) => {
          const data = result.data.suppliers;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const suppliers = <Array<Supplier>>data.nodes;

          if (suppliers) {
            return {
              endCursor,
              hasNextPage,
              suppliers,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getAllSuppliers() {
    return this.apollo
      .watchQuery({
        query: GET_ALL_SUPPLIERS,
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ allSuppliers: Array<Supplier> }>) => {
          const data = result.data.allSuppliers.map((b: Supplier) => {
            const supplier = new Supplier();
            supplier.id = b.id;
            supplier.code = b.code;
            supplier.name = b.name;
            return supplier;
          });

          // Cache the result as ReadonlyArray to prevent external mutation
          this._cachedSuppliers = Object.freeze([...data]);

          return data;
        })
      );
  }

  updateSupplier(supplier: Supplier) {
    const supplierInput: ISupplierInput = {
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
    };

    return this.apollo
      .mutate({
        mutation: UPDATE_SUPPLIER_MUTATION,
        variables: {
          supplierInput,
        },
      })
      .pipe(
        map((result: MutationResult<{ updateSupplier: ISupplierOutput }>) => {
          const output = result.data.updateSupplier;
          const payload = output.supplier;
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

  deleteSuppliers(supplierIds: Array<number>) {
    return this.apollo
      .mutate({
        mutation: DELETE_SUPPLIERS_MUTATION,
        variables: {
          supplierIds,
        },
      })
      .pipe(
        map((result: MutationResult<{ deleteSuppliers: ISupplierOutput }>) => {
          const output = result.data.deleteSuppliers;
          const payload = output.boolean;
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

  checkSupplierCodeExists(supplierId: number, supplierCode: string) {
    return this.apollo
      .watchQuery({
        query: CHECK_SUPPLIER_CODE,
        variables: {
          supplierId,
          supplierCode,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              checkSupplierCode: ISupplierInformationQueryPayload;
            }>
          ) => {
            const data = result.data.checkSupplierCode;
            if (data.typename === 'CheckSupplierCodeInformationResult')
              return (<CheckSupplierCodeInformationResult>(
                result.data.checkSupplierCode
              )).exists;

            return false;
          }
        )
      );
  }

  getTopSuppliersBySales(fromDate: string, toDate: string, cursor: string, sortOrder: SortOrderOptionsEnum) {
    return this.apollo
      .watchQuery({
        query: GET_TOP_SUPPLIERS_BY_SALES,
        variables: {
          fromDate,
          toDate,
          sortOrder,
          cursor
        }
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ topSuppliersBySales: IBaseConnection }>) => {
          const data = result.data.topSuppliersBySales;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const totalCount = data.totalCount;
          const topSupplierBySale = <Array<TopSupplierBySales>>data.nodes;

          const topSupplierBySales: Array<TopSupplierBySales> = topSupplierBySale.map((topSupplierBySaleFromServer: TopSupplierBySales) => {
            const topSupplierBySale = new TopSupplierBySales();
            topSupplierBySale.supplierId = topSupplierBySaleFromServer.supplierId;
            topSupplierBySale.supplierName = topSupplierBySaleFromServer.supplierName;
            topSupplierBySale.supplierCode = topSupplierBySaleFromServer.supplierCode;
            topSupplierBySale.totalSalesAmount = topSupplierBySaleFromServer.totalSalesAmount;
            topSupplierBySale.totalProductsSold = topSupplierBySaleFromServer.totalProductsSold;
            topSupplierBySale.totalTransactions = topSupplierBySaleFromServer.totalTransactions;
            topSupplierBySale.totalSalesAmountFormatted = topSupplierBySaleFromServer.totalSalesAmountFormatted;
            return topSupplierBySale;
          });

          if (topSupplierBySales) {
            return {
              endCursor,
              hasNextPage,
              totalCount,
              topSupplierBySales,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }
}
