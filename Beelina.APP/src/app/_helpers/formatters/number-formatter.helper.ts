export class NumberFormatter {
  static formatCurrency(value: number, withCurrencySymbol = true, currencySymbol = '₱') {
    if (!withCurrencySymbol) currencySymbol = '';
    return `${currencySymbol} ${value
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  static roundToDecimalPlaces(num: number, decimalPlaces: number) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }
}
