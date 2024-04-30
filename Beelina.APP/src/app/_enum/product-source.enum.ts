export enum ProductSourceEnum {
  Panel = 0,
  Warehouse = 1,
}

export function getProductSourceEnum(value: ProductSourceEnum): string {
  switch (value) {
    case ProductSourceEnum.Panel:
      return 'PANEL';
    case ProductSourceEnum.Warehouse:
      return 'WAREHOUSE';
    default:
      return '';
  }
}
