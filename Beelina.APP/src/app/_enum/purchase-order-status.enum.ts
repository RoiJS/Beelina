export enum PurchaseOrderStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export function getPurchaseOrderStatusEnum(value: PurchaseOrderStatusEnum): number {
  switch (value) {
    case PurchaseOrderStatusEnum.OPEN:
      return 1;
    case PurchaseOrderStatusEnum.CLOSED:
      return 2;
    default:
      return 1;
  }
}

export function getPurchaseOrderStatusFromNumber(value: number): PurchaseOrderStatusEnum {
  switch (value) {
    case 1:
      return PurchaseOrderStatusEnum.OPEN;
    case 2:
      return PurchaseOrderStatusEnum.CLOSED;
    default:
      return PurchaseOrderStatusEnum.OPEN;
  }
}
