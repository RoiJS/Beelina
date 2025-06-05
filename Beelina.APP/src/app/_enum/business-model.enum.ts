export enum BusinessModelEnum {
  WarehousePanelMonitoring = 1,
  WarehouseMonitoring = 2,
  WarehousePanelHybridMonitoring = 3,
}

export function getBusinessModelEnum(value: string): BusinessModelEnum {
  switch (value) {
    case 'WAREHOUSE_PANEL_MONITORING':
      return BusinessModelEnum.WarehousePanelMonitoring;
    case 'WAREHOUSE_MONITORING':
      return BusinessModelEnum.WarehouseMonitoring;
    case 'WAREHOUSE_PANEL_HYBRID_MONITORING':
      return BusinessModelEnum.WarehousePanelHybridMonitoring;
    default:
      return null;
  }
}
