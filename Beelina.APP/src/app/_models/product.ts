import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { ProductUnit } from './product-unit';

export class Product extends Entity implements IModelNode {
  public name: string;
  public code: string;
  public description: string;
  public supplierId: number;
  public stockQuantity: number;
  public pricePerUnit: number;
  public costPrice: number;
  public price: number;
  public cost: number;
  public productUnit: ProductUnit;
  public deductedStock: number;
  public withdrawalSlipNo: string;
  public plateNo: string;
  public isTransferable: boolean;
  public numberOfUnits: number;
  public isLinkedToSalesAgent: boolean;
  public validFrom?: Date;
  public validTo?: Date;
  public parent?: boolean;
  public productParentGroupId?: number;

  get priceFormatted(): string {
    return NumberFormatter.formatCurrency(this.price);
  }

  get costFormatted(): string {
    return NumberFormatter.formatCurrency(this.cost);
  }

  get nameWithUnit() {
    return `${this.productUnit.name} - ${this.name}`;
  }

  get isCurrentlyActive(): boolean {
    if (!this.validFrom) {
      return false;
    }

    const now = new Date();
    const validFromDate = new Date(this.validFrom);
    const validToDate = this.validTo ? new Date(this.validTo) : null;

    // Set time to start/end of day for proper comparison
    now.setHours(0, 0, 0, 0);
    validFromDate.setHours(0, 0, 0, 0);

    if (validToDate) {
      validToDate.setHours(23, 59, 59, 999);
    }

    // Product is active if:
    // 1. validFrom date has passed (validFrom <= now)
    // 2. validTo is null OR validTo date hasn't passed yet (validTo >= now)
    return validFromDate <= now && (!validToDate || validToDate >= now);
  }

  constructor() {
    super();
    this.productUnit = new ProductUnit();
  }
}
