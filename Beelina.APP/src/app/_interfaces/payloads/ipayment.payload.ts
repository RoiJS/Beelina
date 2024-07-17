export interface IPaymentPayload {
  transactionId: number;
  amount: number;
  notes: string;
  paymentDate: Date;
}
