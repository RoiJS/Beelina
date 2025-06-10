export enum SalesAgentTypeEnum {
  None = 'NONE',
  FieldAgent = 'FIELD_AGENT',
  WarehouseAgent = 'WAREHOUSE_AGENT',
}
export function getSalesAgentTypeEnum(value: number): SalesAgentTypeEnum {
  switch (value) {
    case 0:
      return SalesAgentTypeEnum.None;
    case 1:
      return SalesAgentTypeEnum.FieldAgent;
    case 2:
      return SalesAgentTypeEnum.WarehouseAgent;
    default:
      return null;
  }
}
export function getSalesAgentTypeEnumNumeric(value: SalesAgentTypeEnum): number {
  switch (value) {
    case SalesAgentTypeEnum.None:
      return 0;
    case SalesAgentTypeEnum.FieldAgent:
      return 1;
    case SalesAgentTypeEnum.WarehouseAgent:
      return 3;
    default:
      return -1;
  }
}
