import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BluetoothPrinterService } from './bluetooth-printer.service';
import { ProductTransaction, Transaction } from '../_models/transaction';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { LogMessageService } from './log-message.service';

import { LogLevelEnum } from '../_enum/log-type.enum';

@Injectable({ providedIn: 'root' })
export class BluetoothPrintInvoiceService {

  bluetoothPrinterService = inject(BluetoothPrinterService);
  loggerService = inject(LogMessageService);
  notificationService = inject(NotificationService);
  translateService = inject(TranslateService);

  constructor() { }

  async print(transaction: Transaction) {
    this.notificationService.openSuccessNotification(
      this.translateService.instant("PRINTING_RECEIPT_PAGE.NOTIFICATION_MESSAGES.PRINTING_MESSAGE")
    );

    try {
      // (1) Connect to printer
      await this.bluetoothPrinterService.connect();

      // (2) Build the receipt content
      const ESC = '\x1B';
      const HEADER_FONT = ESC + 'M' + '\x01' + ESC + '!' + '\x38';
      const SMALL_FONT = ESC + 'M' + '\x01' + ESC + '!' + '\x01';
      const NORMAL_FONT = ESC + '!' + '\x00';

      // Utility function to format columns
      const formatColumn = (text: string, width: number, align: 'left' | 'right' = 'left') => {
        if (text.length > width) return text.substring(0, width - 1) + ' '; // Truncate if too long
        return align === 'left' ? text.padEnd(width, ' ') : text.padStart(width, ' ');
      };

      // Utility function to wrap text if it's too long
      const wrapText = (text: string, maxWidth: number) => {
        const wrapped = [];
        for (let i = 0; i < text.length; i += maxWidth) {
          wrapped.push(text.substring(i, i + maxWidth));
        }
        return wrapped;
      };

      // Header Section
      let receipt = '';
      receipt += HEADER_FONT;
      receipt += '         ' + this.translateService.instant("GENERAL_TEXTS.BIZUAL") + '\n';
      receipt += NORMAL_FONT;
      receipt += '================================================\n';
      receipt += formatColumn(this.translateService.instant("PRINTING_RECEIPT_PAGE.HEADER_SECTION.TRANSACTION_NO"), 25) +
        formatColumn(transaction.invoiceNo, 20, 'right') + '\n';
      receipt += formatColumn(this.translateService.instant("PRINTING_RECEIPT_PAGE.HEADER_SECTION.TRANSACTION_DATE"), 25) +
        formatColumn(DateFormatter.format(transaction.transactionDate), 20, 'right') + '\n';
      receipt += '================================================\n\n';

      // Table Header
      receipt += SMALL_FONT;
      receipt += formatColumn(this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.COLUMNS.ITEM_NAME"), 25) +
        formatColumn(this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.COLUMNS.QUANTITY"), 10, 'right') +
        formatColumn(this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.COLUMNS.UNIT_PRICE"), 12, 'right') + '\n';
      receipt += '------------------------------------------------\n';

      // Table Rows with wrapping for long names
      transaction.productTransactions.forEach((productTransaction: ProductTransaction) => {
        const wrappedName = wrapText(productTransaction.product.name, 35);
        wrappedName.forEach((line, index) => {
          receipt += formatColumn(line, 25) +
            (index === 0 ? formatColumn(productTransaction.quantity.toString(), 10, 'right') : ''.padEnd(10, ' ')) +
            (index === 0 ? formatColumn(NumberFormatter.formatCurrency(productTransaction.price, false), 12, 'right') : ''.padEnd(12, ' ')) + '\n';
        });
      });

      receipt += '------------------------------------------------\n';

      // Footer Section
      receipt += formatColumn(this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.FOOTER_SECTION.GROSS_AMOUNT"), 25) +
        formatColumn(NumberFormatter.formatCurrency(transaction.total, false), 20, 'right') + '\n';
      receipt += formatColumn(this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.FOOTER_SECTION.DISCOUNT_AMOUNT"), 25) +
        formatColumn(NumberFormatter.formatCurrency(transaction.discount, false), 20, 'right') + '\n';
      receipt += formatColumn(this.translateService.instant("PRINTING_RECEIPT_PAGE.BODY_SECTION.ITEM_GRID.FOOTER_SECTION.NET_AMOUNT"), 25) +
        formatColumn(NumberFormatter.formatCurrency(transaction.netTotal, false), 20, 'right') + '\n';

      receipt += '================================================\n';
      receipt += DateFormatter.format(new Date(), 'YYYY-MM-DD hh:mm A') + '\n\n';
      receipt += '               ' + this.translateService.instant("PRINTING_RECEIPT_PAGE.FOOTER_SECTION.POWERED_BY_LABEL") + '\n\n\n\n\n';

      // (3) Print receipt
      await this.bluetoothPrinterService.printText(receipt);
      this.notificationService.openSuccessNotification(
        this.translateService.instant("PRINTING_RECEIPT_PAGE.NOTIFICATION_MESSAGES.PRINTING_SUCCESS_MESSAGE")
      );
    } catch (error) {
      // (4) If printing fails, we'll try to print again.
      if (!error.name.includes('NotFoundError')) {
        this.loggerService.logMessage(LogLevelEnum.ERROR, `${error.name}: ${error.message}`);
        await this.print(transaction);
      } else {
        this.loggerService.logMessage(LogLevelEnum.ERROR, `${error.name}: ${error.message}`);
        this.notificationService.openErrorNotification(
          this.translateService.instant("PRINTING_RECEIPT_PAGE.NOTIFICATION_MESSAGES.PRINTING_ERROR_MESSAGE")
        );
      }
    }
  }

}
