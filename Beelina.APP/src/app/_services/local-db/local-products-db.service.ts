import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { LocalBaseDbService } from './local-base-db.service';
import { ProductService } from '../product.service';
import { ProductUnitService } from '../product-unit.service';
import { StorageService } from '../storage.service';

import { Product } from 'src/app/_models/product';
import { LocalProduct } from 'src/app/_models/local-db/local-product.model';
import { LocalProductUnit } from 'src/app/_models/local-db/local-product-unit.model';
import { ProductUnit } from 'src/app/_models/product-unit';
import { ProductTransaction } from 'src/app/_models/transaction';
import { ProductInformationResult } from 'src/app/_models/results/product-information-result';
import { StockStatusEnum } from 'src/app/_enum/stock-status.enum';
import { PriceStatusEnum } from 'src/app/_enum/price-status.enum';

@Injectable({
  providedIn: 'root'
})
export class LocalProductsDbService extends LocalBaseDbService {

  private productService = inject(ProductService);
  private productUnitService = inject(ProductUnitService);
  private storageService = inject(StorageService);
  private pageNumber: number = 1;

  async getProductsFromServer() {
    const allProducts: Array<Product> = [];
    let result: {
      endCursor: string;
      hasNextPage: boolean;
      products: Array<Product>;
      totalCount: number;
    } = {
      endCursor: null,
      hasNextPage: false,
      products: [],
      totalCount: 0
    };

    const productsCount = <number>await firstValueFrom(this.localDbService.count('products'));

    if (productsCount > 0) return;

    const userAccountId = +this.storageService.getString('currentSalesAgentId');

    do {
      result = await firstValueFrom(this.productService.getProducts(userAccountId, result.endCursor, "", 0, StockStatusEnum.All, PriceStatusEnum.All, 1000, []));
      allProducts.push(...result.products);
    } while (result.hasNextPage);

    const customerUserId = await this.getCustomerUserId();
    const localProducts: Array<LocalProduct> = allProducts.map(product => {
      const localProduct = new LocalProduct();
      localProduct.customerUserId = customerUserId;
      localProduct.productId = product.id;
      localProduct.code = product.code;
      localProduct.name = product.name;
      localProduct.description = product.description;
      localProduct.supplierId = product.supplierId;
      localProduct.stockQuantity = product.stockQuantity;
      localProduct.pricePerUnit = product.pricePerUnit;
      localProduct.price = product.price;
      localProduct.isTransferable = product.isTransferable;
      localProduct.numberOfUnits = product.numberOfUnits;
      localProduct.productUnitId = product.productUnit.id;
      return localProduct;
    });

    const newProducts = await firstValueFrom(this.localDbService.bulkAdd('products', localProducts));
    console.info('newProductsCount: ', newProducts.length);
  }

  async getMyLocalProducts(filterKeyword: string, supplierId: number, stockStatus: StockStatusEnum, priceStatus: PriceStatusEnum, limit: number, productTransactionItems: Array<ProductTransaction>): Promise<{
    endCursor: string;
    hasNextPage: boolean;
    products: Array<Product>;
    totalCount: number;
  }> {
    let result: {
      endCursor: string;
      hasNextPage: boolean;
      products: Array<Product>;
      totalCount: number;
    } = {
      endCursor: null,
      hasNextPage: false,
      products: [],
      totalCount: 0
    };
    const customerUserId = await this.getCustomerUserId();
    const localProductsFromLocalDb = <Array<LocalProduct>>await firstValueFrom(this.localDbService.getAll('products'));
    result.totalCount = localProductsFromLocalDb.length;

    let myLocalProducts = localProductsFromLocalDb.filter(c => c.customerUserId == customerUserId);

    // Filter based on supplier id
    if (supplierId > 0) {
      myLocalProducts = myLocalProducts.filter(c => c.supplierId == supplierId);
    }

    // Filter based on stock status
    if (stockStatus !== StockStatusEnum.All) {
      if (stockStatus === StockStatusEnum.WithStocks) {
        myLocalProducts = myLocalProducts.filter(c => c.stockQuantity > 0);
      } else if (stockStatus === StockStatusEnum.WithoutStocks) {
        myLocalProducts = myLocalProducts.filter(c => c.stockQuantity === 0);
      }
    }

    // Filter based on price status
    if (priceStatus !== PriceStatusEnum.All) {
      if (priceStatus === PriceStatusEnum.WithPrice) {
        myLocalProducts = myLocalProducts.filter(c => c.pricePerUnit > 0);
      } else if (priceStatus === PriceStatusEnum.WithoutPrice) {
        myLocalProducts = myLocalProducts.filter(c => c.pricePerUnit === 0);
      }
    }

    if (filterKeyword) {
      const filterKeywords = filterKeyword.toLowerCase().split(',').map(k => k.trim().split(' '));

      myLocalProducts = myLocalProducts.filter(product =>
        filterKeywords.some(keywordArray => keywordArray.every(keyword => product.name.toLowerCase().includes(keyword) || product.code.toLowerCase().includes(keyword)))
      );

      result.totalCount = myLocalProducts.length;

      if (this.pageNumber === 1) limit = 0;
    }

    if (limit > 0) {
      const startIndex = (this.pageNumber - 1) * limit;
      const endIndex = startIndex + limit;
      myLocalProducts = myLocalProducts.slice(startIndex, endIndex);
    }

    const products = await Promise.all(myLocalProducts.map(async (localProduct: LocalProduct) => {
      const product = new Product();
      product.id = localProduct.productId;
      product.code = localProduct.code;
      product.name = localProduct.name;
      product.description = localProduct.description;
      product.stockQuantity = localProduct.stockQuantity;
      product.pricePerUnit = localProduct.pricePerUnit;
      product.supplierId = localProduct.supplierId;
      product.price = localProduct.price;
      product.isTransferable = localProduct.isTransferable;
      product.numberOfUnits = localProduct.numberOfUnits;
      product.deductedStock =
        -productTransactionItems.find(
          (pt) => pt.productId === localProduct.productId
        )?.quantity | 0;

      const localProductUnit = await this.getLocalProductUnit(localProduct.productUnitId);
      const productUnit = new ProductUnit();
      productUnit.id = localProductUnit.productUnitId;
      productUnit.name = localProductUnit.name;

      product.productUnit = productUnit;
      return product;
    }));

    result.products = products;

    this.pageNumber++;

    return result;
  }

  async getProductUnitsFromServer() {

    const allProductUnits: Array<ProductUnit> = [];
    let result: {
      endCursor: string;
      hasNextPage: boolean;
      productUnits: Array<ProductUnit>;
    } = {
      endCursor: null,
      hasNextPage: false,
      productUnits: [],
    };

    const productUnitsCouht = <number>await firstValueFrom(this.localDbService.count('products'));
    if (productUnitsCouht > 0) return;

    do {
      result = await firstValueFrom(this.productUnitService.getProductUnits(result.endCursor, 1000));
      allProductUnits.push(...result.productUnits);
    } while (result.hasNextPage);

    const customerUserId = await this.getCustomerUserId();
    const localProductUnits = allProductUnits.map(productUnit => {
      const localProductUnit = new LocalProductUnit();
      localProductUnit.customerUserId = customerUserId;
      localProductUnit.name = productUnit.name;
      localProductUnit.productUnitId = productUnit.id;
      return localProductUnit;
    });

    const newLocalProductUnits = await firstValueFrom(this.localDbService.bulkAdd('productUnits', localProductUnits));
    console.info('newLocalProductUnitsCount: ', newLocalProductUnits.length);
  }

  async getMyLocalProductById(productId: number) {
    const localProduct = <LocalProduct>await firstValueFrom(this.localDbService.getByIndex('products', 'productId', productId));
    if (!localProduct) return null;

    const productInformationResult = new ProductInformationResult();
    productInformationResult.id = localProduct.productId;
    productInformationResult.name = localProduct.name;
    productInformationResult.code = localProduct.code;
    productInformationResult.description = localProduct.description;
    productInformationResult.stockQuantity = localProduct.stockQuantity;
    productInformationResult.pricePerUnit = localProduct.pricePerUnit;
    productInformationResult.price = localProduct.price;
    productInformationResult.isTransferable = localProduct.isTransferable;
    productInformationResult.numberOfUnits = localProduct.numberOfUnits;

    const localProductUnit = await this.getLocalProductUnit(localProduct.productUnitId);
    const productUnit = new ProductUnit();
    productUnit.id = localProductUnit.productUnitId;
    productUnit.name = localProductUnit.name;

    productInformationResult.productUnit = productUnit;

    return productInformationResult;
  }

  async getMyLocalProductByCode(productCode: string) {
    const localProduct = <LocalProduct>await firstValueFrom(this.localDbService.getByIndex('products', 'code', productCode));
    if (!localProduct) return null;

    const productInformationResult = new ProductInformationResult();
    productInformationResult.id = localProduct.productId;
    productInformationResult.name = localProduct.name;
    productInformationResult.code = localProduct.code;
    productInformationResult.description = localProduct.description;
    productInformationResult.stockQuantity = localProduct.stockQuantity;
    productInformationResult.pricePerUnit = localProduct.pricePerUnit;
    productInformationResult.price = localProduct.price;
    productInformationResult.isTransferable = localProduct.isTransferable;
    productInformationResult.numberOfUnits = localProduct.numberOfUnits;

    const localProductUnit = await this.getLocalProductUnit(localProduct.productUnitId);
    const productUnit = new ProductUnit();
    productUnit.id = localProductUnit.productUnitId;
    productUnit.name = localProductUnit.name;

    productInformationResult.productUnit = productUnit;

    return productInformationResult;
  }

  async analyzeTextOrder(textOrders: string) {

    const textOrdersArray = textOrders.split('\n');
    const productTransactions = new Array<ProductTransaction>();

    for (let textOrder of textOrdersArray) {

      var textOrderLines = textOrder.split("*");

      if (textOrderLines.length > 1) {
        const productCode = textOrderLines[0].trim();
        const productQuantity = parseInt(textOrderLines[1].trim());
        const product = await this.getMyLocalProductByCode(productCode);

        if (product) {
          const productTransaction = new ProductTransaction();
          productTransaction.id = 0;
          productTransaction.code = product.code;
          productTransaction.productId = product.id;
          productTransaction.productName = product.name;
          productTransaction.price = product.pricePerUnit;
          productTransaction.quantity = productQuantity;
          productTransaction.currentQuantity = 0;
          productTransactions.push(productTransaction);
        }
      }
    }

    return productTransactions;
  }

  reset() {
    this.pageNumber = 1;
  }

  async getLocalProductUnit(productUnitId: number): Promise<LocalProductUnit> {
    const localProductUnit = <LocalProductUnit>await firstValueFrom(this.localDbService.getByIndex('productUnits', 'productUnitId', productUnitId));
    return localProductUnit;
  }

  async clear() {
    await firstValueFrom(this.localDbService.clear('products'));
    await firstValueFrom(this.localDbService.clear('productUnits'));
    console.info("Cleared local products.");
  }
}
