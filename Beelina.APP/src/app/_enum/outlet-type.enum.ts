export enum OutletTypeEnum {
  KEY_ACCOUNT = 'KEY_ACCOUNT',
  GEN_TRADE = 'GEN_TRADE',
}

export function getOutletTypeEnum(value: OutletTypeEnum): number {
  switch (value) {
    case OutletTypeEnum.KEY_ACCOUNT:
      return 0;
    case OutletTypeEnum.GEN_TRADE:
      return 1;
    default:
      return -1;
  }
}
