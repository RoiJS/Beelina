export enum TransactionStatusEnum {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  BAD_ORDER = 'BAD_ORDER',
}

export function getTransactionStatusEnum(value: TransactionStatusEnum): number {
  switch (value) {
    case TransactionStatusEnum.DRAFT:
      return 1;
    case TransactionStatusEnum.CONFIRMED:
      return 2;
    case TransactionStatusEnum.BAD_ORDER:
      return 3;
    default:
      return -1;
  }
}
