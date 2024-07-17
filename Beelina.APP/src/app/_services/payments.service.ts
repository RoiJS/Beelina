import { Injectable, inject } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';

import { Apollo, MutationResult, gql } from 'apollo-angular';
import { map } from 'rxjs';

import { IBaseConnection } from '../_interfaces/connections/ibase.connection';

import { Payment } from '../_models/payment';
import { IPaymentInput } from '../_interfaces/inputs/ipayment.input';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { IPaymentOutput } from '../_interfaces/outputs/ipayment.output';

const REGISTER_PAYMENT = gql`
  mutation($paymentInput: PaymentInput!) {
    registerPayment(input: { paymentInput: $paymentInput }) {
      payment {
          id
          transactionId
          amount
          notes
          paymentDate
      }
    }
  }
`;

const GET_PAYMENTS = gql`
  query($transactionId: Int!, $cursor: String) {
    payments(transactionId: $transactionId, after: $cursor, order: [{ paymentDate: DESC }]) {
       nodes {
            id,
            transactionId
            amount
            notes
            paymentDate
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

@Injectable({ providedIn: 'root' })
export class PaymentService {

  apollo = inject(Apollo);

  constructor() { }

  getPayments(cursor: string, transactionId: number) {
    return this.apollo
      .watchQuery({
        query: GET_PAYMENTS,
        variables: {
          cursor,
          transactionId,
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ payments: IBaseConnection }>) => {
          const data = result.data.payments;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const payments = <Array<Payment>>data.nodes.map((p: Payment) => {
            const payment = new Payment();
            payment.id = p.id;
            payment.transactionId = p.transactionId;
            payment.amount = p.amount;
            payment.paymentDate = p.paymentDate;
            payment.notes = p.notes;
            return payment;
          });;


          if (payments) {
            return {
              endCursor,
              hasNextPage,
              payments,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  registerPayment(payment: Payment) {
    const paymentInput: IPaymentInput = {
      transactionId: payment.transactionId,
      amount: payment.amount,
      notes: payment.notes,
      paymentDate: DateFormatter.format(
        payment.paymentDate
      ),
    };

    return this.apollo
      .mutate({
        mutation: REGISTER_PAYMENT,
        variables: {
          paymentInput,
        },
      })
      .pipe(
        map((result: MutationResult<{ registerPayment: IPaymentOutput }>) => {
          const output = result.data.registerPayment;
          const payload = output.payment;
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
