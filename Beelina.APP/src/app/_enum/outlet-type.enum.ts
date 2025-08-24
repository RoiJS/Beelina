export enum OutletTypeEnum {
  KEY_ACCOUNT = 'KEY_ACCOUNT',
  GEN_TRADE = 'GEN_TRADE',
  SUPERMARKET = 'SUPERMARKET',
  GROCERY = 'GROCERY',
  PUBLIC_MARKET_STOOL_STORE = 'PUBLIC_MARKET_STOOL_STORE',
  SARI_SARI_STORE = 'SARI_SARI_STORE',
  FOOD_SERVICES = 'FOOD_SERVICES',
  CONVENIENCE_STORE = 'CONVENIENCE_STORE',
  PHARMACY = 'PHARMACY',
  GASOLINE_STATION = 'GASOLINE_STATION',
}

export function getOutletTypeEnum(value: OutletTypeEnum): number {
  switch (value) {
    case OutletTypeEnum.KEY_ACCOUNT:
      return 1;
    case OutletTypeEnum.GEN_TRADE:
      return 2;
    case OutletTypeEnum.SUPERMARKET:
      return 3;
    case OutletTypeEnum.GROCERY:
      return 4;
    case OutletTypeEnum.PUBLIC_MARKET_STOOL_STORE:
      return 5;
    case OutletTypeEnum.SARI_SARI_STORE:
      return 6;
    case OutletTypeEnum.FOOD_SERVICES:
      return 7;
    case OutletTypeEnum.CONVENIENCE_STORE:
      return 8;
    case OutletTypeEnum.PHARMACY:
      return 9;
    case OutletTypeEnum.GASOLINE_STATION:
      return 10;
    default:
      return -1;
  }
}

export function getOutletTypeEnumFromNumber(value: number): OutletTypeEnum | null {
  switch (value) {
    case 1:
      return OutletTypeEnum.KEY_ACCOUNT;
    case 2:
      return OutletTypeEnum.GEN_TRADE;
    case 3:
      return OutletTypeEnum.SUPERMARKET;
    case 4:
      return OutletTypeEnum.GROCERY;
    case 5:
      return OutletTypeEnum.PUBLIC_MARKET_STOOL_STORE;
    case 6:
      return OutletTypeEnum.SARI_SARI_STORE;
    case 7:
      return OutletTypeEnum.FOOD_SERVICES;
    case 8:
      return OutletTypeEnum.CONVENIENCE_STORE;
    case 9:
      return OutletTypeEnum.PHARMACY;
    case 10:
      return OutletTypeEnum.GASOLINE_STATION;
    default:
      return null;
  }
}
