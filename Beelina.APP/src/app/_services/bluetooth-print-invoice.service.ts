import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BluetoothPrinterService } from './bluetooth-printer.service';
import { ProductTransaction, Transaction } from '../_models/transaction';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';

@Injectable({ providedIn: 'root' })
export class BluetoothPrintInvoiceService {

  bluetoothPrinterService = inject(BluetoothPrinterService);
  translateService = inject(TranslateService);

  constructor() { }

  async print(transaction: Transaction) {

    try {
      // (1) Connect to printer
      await this.bluetoothPrinterService.connect();

      // (2) Build the receipt content
      const ESC = '\x1B';
      let receipt = '';
      receipt += ESC + '!' + '\x38';
      receipt += '     ' + this.translateService.instant("GENERAL_TEXTS.BIZUAL") + '\n';
      receipt += ESC + '!' + '\x00';
      receipt += '-------------------------------\n';
      receipt += this.translateService.instant("PRINTING_RECEIPT_PAGE.HEADER_SECTION.TRANSACTION_NO") + ' ' + transaction.invoiceNo + '\n';
      receipt += this.translateService.instant("PRINTING_RECEIPT_PAGE.HEADER_SECTION.TRANSACTION_DATE") + ' ' + DateFormatter.format(transaction.transactionDate) + '\n';
      receipt += '-------------------------------\n';
      receipt += this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.COLUMNS.ITEM_NAME") + '          ' +this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.COLUMNS.QUANTITY")+ '         ' +this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.COLUMNS.UNIT_PRICE") + '\n';
      transaction.productTransactions.forEach((productTransaction: ProductTransaction) => {
        receipt += productTransaction.product.name + '        ' + productTransaction.quantity + '   ' + NumberFormatter.formatCurrency(productTransaction.price, false) + '\n';
      });
      receipt += '--------------------------------\n';
      receipt += this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.FOOTER_SECTION.GROSS_AMOUNT") + ' ' + NumberFormatter.formatCurrency(transaction.total, false) + '\n';
      receipt += this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.FOOTER_SECTION.DISCOUNT_AMOUNT") + ' ' + transaction.discount + '\n';
      receipt += this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.FOOTER_SECTION.NET_AMOUNT") + ' ' + NumberFormatter.formatCurrency(transaction.netTotal, false) + '\n';
      receipt += '--------------------------------\n';
      receipt += DateFormatter.format(new Date(), 'YYYY-MM-DD hh:mm A') + '\n';
      receipt += '         ' + this.translateService.instant("PRINTING_RECEIPT_PAGE.FOOTER_SECTION.POWERED_BY_LABEL") + '\n\n\n\n';

      // (3) Print receipt
      await this.bluetoothPrinterService.printText(receipt);
    } catch {

      // (4) If printing fails, well try to print again.
      await this.print(transaction);
    }
  }
}
