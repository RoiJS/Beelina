using Beelina.LIB.Models;

namespace Beelina.LIB.Helpers
{
    public static class DiscountCalculationHelper
    {
        public static decimal CalculateNetAmount(decimal grossAmount, IEnumerable<ProductWarehouseStockReceiptDiscount> discounts)
        {
            if (discounts == null || !discounts.Any())
                return grossAmount;

            var orderedDiscounts = discounts.OrderBy(d => d.DiscountOrder);
            decimal currentAmount = grossAmount;

            foreach (var discount in orderedDiscounts)
            {
                decimal discountAmount = currentAmount * (decimal)(discount.DiscountPercentage / 100);
                currentAmount -= discountAmount;
            }

            return currentAmount;
        }

        public static decimal CalculateTotalDiscountPercentage(IEnumerable<ProductWarehouseStockReceiptDiscount> discounts)
        {
            if (discounts == null || !discounts.Any())
                return 0;

            var orderedDiscounts = discounts.OrderBy(d => d.DiscountOrder);
            decimal remaining = 100;

            foreach (var discount in orderedDiscounts)
            {
                remaining = remaining * (100 - (decimal)discount.DiscountPercentage) / 100;
            }

            return 100 - remaining;
        }

        public static decimal CalculateTotalDiscountAmount(decimal grossAmount, IEnumerable<ProductWarehouseStockReceiptDiscount> discounts)
        {
            if (discounts == null || !discounts.Any())
                return 0;

            var netAmount = CalculateNetAmount(grossAmount, discounts);
            return grossAmount - netAmount;
        }
    }
}