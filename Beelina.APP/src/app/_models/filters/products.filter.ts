export class ProductsFilter {
  public supplierId: number = 0;

  isActive() {
    return this.supplierId !== 0;
  }
}
