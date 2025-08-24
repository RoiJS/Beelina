import { TranslateService } from '@ngx-translate/core';
import { OutletTypeEnum, getOutletTypeEnumFromNumber } from '../_enum/outlet-type.enum';

export class OutletTypeHelper {
  static getOutletTypeDisplayText(outletType: OutletTypeEnum | string | number, translateService: TranslateService): string {
    let enumValue: OutletTypeEnum;

    // Handle different input types
    if (typeof outletType === 'string') {
      enumValue = outletType as OutletTypeEnum;
    } else if (typeof outletType === 'number') {
      // Convert numeric value to enum
      const convertedEnum = getOutletTypeEnumFromNumber(outletType);
      enumValue = convertedEnum || OutletTypeEnum.KEY_ACCOUNT; // Default fallback
    } else {
      enumValue = outletType;
    }

    switch (enumValue) {
      case OutletTypeEnum.KEY_ACCOUNT:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.KEY_ACCOUNT');
      case OutletTypeEnum.GEN_TRADE:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.GEN_TRADE');
      case OutletTypeEnum.SUPERMARKET:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.SUPERMARKET');
      case OutletTypeEnum.GROCERY:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.GROCERY');
      case OutletTypeEnum.PUBLIC_MARKET_STOOL_STORE:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.PUBLIC_MARKET_STOOL_STORE');
      case OutletTypeEnum.SARI_SARI_STORE:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.SARI_SARI_STORE');
      case OutletTypeEnum.FOOD_SERVICES:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.FOOD_SERVICES');
      case OutletTypeEnum.CONVENIENCE_STORE:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.CONVENIENCE_STORE');
      case OutletTypeEnum.PHARMACY:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.PHARMACY');
      case OutletTypeEnum.GASOLINE_STATION:
        return translateService.instant('ADD_CUSTOMER_DETAILS_PAGE.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.GASOLINE_STATION');
      default:
        return '';
    }
  }
}
