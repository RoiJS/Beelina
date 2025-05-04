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
      receipt += '     Bizual\n';
      receipt += ESC + '!' + '\x00';
      receipt += '-------------------------------\n';
      receipt += 'Transaction No: ' + transaction.invoiceNo + '\n';
      receipt += 'Transaction Date: ' + DateFormatter.format(transaction.transactionDate) + '\n';
      receipt += '-------------------------------\n';
      receipt += 'Item          Qty         Price\n';
      transaction.productTransactions.forEach((productTransaction: ProductTransaction) => {
        receipt += productTransaction.product.name + '        ' + productTransaction.quantity + '   ' + NumberFormatter.formatCurrency(productTransaction.price, false) + '\n';
      });
      receipt += '--------------------------------\n';
      receipt += 'Gross Total: ' + NumberFormatter.formatCurrency(transaction.total, false) + '\n';
      receipt += 'Discount (%): ' + transaction.discount + '\n';
      receipt += 'Net Total: ' + NumberFormatter.formatCurrency(transaction.netTotal, false) + '\n';
      receipt += '--------------------------------\n';
      receipt += DateFormatter.format(new Date(), 'YYYY-MM-DD hh:mm A') + '\n';
      receipt += '      Powered by Bizual\n\n\n\n';

      // (3) Print receipt
      await this.bluetoothPrinterService.printText(receipt);
    } catch {

      // (4) If printing fails, well try to print again.
      await this.print(transaction);
    }
  }
}
