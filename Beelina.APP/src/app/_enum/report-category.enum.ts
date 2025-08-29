export enum ReportCategoryEnum {
  OrderTransactions = "ORDER_TRANSACTIONS",
  Products = "PRODUCTS",
  Sales = "SALES"
}


export function getReportCategoryNumeric(category: ReportCategoryEnum): number {
  switch (category) {
    case ReportCategoryEnum.OrderTransactions:
      return 1;
    case ReportCategoryEnum.Products:
      return 2;
    case ReportCategoryEnum.Sales:
      return 3;
    default:
      return 0;
  }
}
