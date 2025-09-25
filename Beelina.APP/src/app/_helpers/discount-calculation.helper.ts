import { ProductWarehouseStockReceiptDiscount } from '../_models/product-warehouse-stock-receipt-discount.model';

/**
 * Helper class for calculating discount amounts using sequential discount application.
 * Mirrors the logic from Beelina.LIB.Helpers.DiscountCalculationHelper.cs
 */
export class DiscountCalculationHelper {

  /**
   * Calculates the net amount after applying multiple discounts sequentially.
   *
   * Example:
   * - Gross Amount: $100
   * - First Discount (5%): $100 - ($100 * 0.05) = $95
   * - Second Discount (2%): $95 - ($95 * 0.02) = $93.10
   *
   * @param grossAmount The original amount before discounts
   * @param discounts Array of discount entries to apply
   * @returns The final amount after all discounts are applied
   */
  static calculateNetAmount(grossAmount: number, discounts: ProductWarehouseStockReceiptDiscount[]): number {
    if (!Number.isFinite(grossAmount) || grossAmount < 0) {
      throw new Error('Gross amount must be a non-negative number');
    }

    if (!discounts || discounts.length === 0) {
      return grossAmount;
    }

    // Sort discounts by order to ensure proper sequential application
    const orderedDiscounts = discounts
      .filter(d => d.discountPercentage > 0 && d.discountPercentage <= 100) // Only apply valid discounts
      .sort((a, b) => a.discountOrder - b.discountOrder);

    let currentAmount = grossAmount;

    for (const discount of orderedDiscounts) {
      const discountAmount = currentAmount * (discount.discountPercentage / 100);
      currentAmount -= discountAmount;
    }

    // Use parseFloat with toFixed for more reliable rounding
    return parseFloat(currentAmount.toFixed(2));
  }
  /**
   * Calculates the total effective discount percentage from multiple sequential discounts.
   *
   * Example:
   * - First Discount: 5%
   * - Second Discount: 2%
   * - Effective Total: 6.9% (not 7%)
   *
   * @param discounts Array of discount entries
   * @returns The total effective discount percentage
   */
  static calculateTotalDiscountPercentage(discounts: ProductWarehouseStockReceiptDiscount[]): number {
    if (!discounts || discounts.length === 0) {
      return 0;
    }

    const orderedDiscounts = discounts
      .filter(d => d.discountPercentage > 0 && d.discountPercentage <= 100)
      .sort((a, b) => a.discountOrder - b.discountOrder);

    let remaining = 100;

    for (const discount of orderedDiscounts) {
      remaining = remaining * (100 - discount.discountPercentage) / 100;
    }

    const totalDiscount = 100 - remaining;
    return parseFloat(totalDiscount.toFixed(2));
  }
  /**
   * Calculates the total discount amount in currency.
   *
   * @param grossAmount The original amount before discounts
   * @param discounts Array of discount entries
   * @returns The total amount discounted
   */
  static calculateTotalDiscountAmount(grossAmount: number, discounts: ProductWarehouseStockReceiptDiscount[]): number {
    const netAmount = this.calculateNetAmount(grossAmount, discounts);
    return Math.round((grossAmount - netAmount) * 100) / 100;
  }

  /**
   * Validates that discount orders are sequential and unique.
   *
   * @param discounts Array of discount entries to validate
   * @returns Array of validation errors, empty if valid
   */
  static validateDiscountOrder(discounts: ProductWarehouseStockReceiptDiscount[]): string[] {
    const errors: string[] = [];

    if (!discounts || discounts.length === 0) {
      return errors;
    }

    // Check for duplicate orders
    const orders = discounts.map(d => d.discountOrder);
    const uniqueOrders = new Set(orders);

    if (orders.length !== uniqueOrders.size) {
      errors.push('Discount orders must be unique');
    }

    // Check for gaps in sequence (optional - depends on business rules)
    const sortedOrders = [...uniqueOrders].sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i + 1) {
        errors.push('Discount orders should be sequential starting from 1');
        break;
      }
    }

    return errors;
  }

  /**
   * Reorders discounts to ensure sequential numbering.
   *
   * @param discounts Array of discount entries
   * @returns Array with reordered discount orders
   */
  static reorderDiscounts(discounts: ProductWarehouseStockReceiptDiscount[]): ProductWarehouseStockReceiptDiscount[] {
    return discounts
      .sort((a, b) => a.discountOrder - b.discountOrder)
      .map((discount, index) => ({
        ...discount,
        discountOrder: index + 1
      }));
  }
}
