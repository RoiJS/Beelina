import { Injectable, inject } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';

import { Apollo, MutationResult, gql } from 'apollo-angular';
import { map } from 'rxjs';

import { IBaseConnection } from '../_interfaces/connections/ibase.connection';

import { ISupplierInput } from '../_interfaces/inputs/isupplier.input';
import { Supplier } from '../_models/supplier';
import { ISupplierOutput } from '../_interfaces/outputs/isupplier.output';
import { ISupplierInformationQueryPayload } from '../_interfaces/payloads/isupplier-information-query.payload';
import { CheckSupplierCodeInformationResult } from '../_models/results/check-supplier-code-information-result';

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

@Injectable({ providedIn: 'root' })
export class SupplierService {

  apollo = inject(Apollo);

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
            const barangay = new Supplier();
            barangay.id = b.id;
            barangay.code = b.code;
            barangay.name = b.name;
            return barangay;
          });

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
}
