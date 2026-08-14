export class CommonUtils {
  static formatPrice(price) {
    return Number(price.replace("$", ""));
  }

  static formatPrices(prices) {
    return prices.map((price) => this.formatPrice(price));
  }
}
