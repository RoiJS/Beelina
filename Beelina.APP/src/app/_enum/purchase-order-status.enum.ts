export enum PurchaseOrderStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export function getPurchaseOrderStatusEnum(value: PurchaseOrderStatusEnum): number {
  switch (value) {
    case PurchaseOrderStatusEnum.OPEN:
      return 0;
    case PurchaseOrderStatusEnum.CLOSED:
      return 1;
    default:
      return 0;
  }
}

export function getPurchaseOrderStatusFromNumber(value: number): PurchaseOrderStatusEnum {
  switch (value) {
    case 0:
      return PurchaseOrderStatusEnum.OPEN;
    case 1:
      return PurchaseOrderStatusEnum.CLOSED;
    default:
      return PurchaseOrderStatusEnum.OPEN;
  }
}
