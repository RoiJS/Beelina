export enum BusinessModelEnum {
  WarehousePanelMonitoring = 1,
  WarehouseMonitoring = 2,
}

export function getBusinessModelEnum(value: string): BusinessModelEnum {
  switch (value) {
    case 'WAREHOUSE_PANEL_MONITORING':
      return BusinessModelEnum.WarehousePanelMonitoring;
    case 'WAREHOUSE_MONITORING':
      return BusinessModelEnum.WarehouseMonitoring;
    default:
      return null;
  }
}
