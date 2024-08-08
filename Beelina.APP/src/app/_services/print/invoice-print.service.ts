import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BasePrintService } from './base-print.service';

import { InvoiceData, TransactionService } from '../transaction.service';

import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';

import { ProductTransaction } from 'src/app/_models/transaction';
import { User } from 'src/app/_models/user.model';

import { PrintForSettingsEnum } from 'src/app/_enum/print-for-settings.enum';

@Injectable({
  providedIn: 'root'
})
export class InvoicePrintService extends BasePrintService {

  transactionService = inject(TransactionService);
  constructor() {
    super();
  }

  async printInvoice(transactionId: number, printFor: PrintForSettingsEnum) {
    const data = await firstValueFrom(this.transactionService.getInvoiceData(transactionId));
    const invoiceReceiptTemplate = this.constructReceiptTemplate(data, printFor);
    this.print(invoiceReceiptTemplate);
  }

  private constructReceiptTemplate(data: InvoiceData, printFor: PrintForSettingsEnum) {
    const generalSettings = data.generalSettings;
    const transaction = data.transaction.transaction;

    const companyName = generalSettings.companyName;
    const ownerName = generalSettings.ownerName;
    const address = generalSettings.address;
    const telephone = generalSettings.telephone;
    const faxTelephone = generalSettings.faxTelephone;
    const tin = generalSettings.tin;
    const saleAgentName = (<User>transaction.createdBy).fullname;

    const badOrderTemplate = transaction.badOrderAmount > 0 ? `
      <div class="invoice-summary-amount-section__details">
          <span class="property">Bad Order: </span>
          <span class="value">${NumberFormatter.formatCurrency(data.transaction.badOrderAmount, false)}</span>
      </div>
    ` : '';

    const discountTemplate = transaction.discount > 0 ? `
      <div class="invoice-summary-amount-section__details">
          <span class="property">Discount: </span>
          <span class="value">${transaction.discount}%</span>
      </div>
    ` : '';

    const telephoneNumberTemplate = telephone.length > 0 ? `Telephone: ${telephone};` : '';
    const faxTelephoneNumberTemplate = faxTelephone.length > 0 ? `Fax tel: ${faxTelephone}` : '';
    const tinTemplate = tin.length > 0 ? `TIN: ${tin}` : '';
    const deliverShipTo = printFor === PrintForSettingsEnum.CUSTOMER ? `${transaction.store.name}<br>${transaction.store.barangay.name}` : saleAgentName;

    const element = `
            <!DOCTYPE html>
            <html>
              <body>
                <div class="receipt-template">
                    <div class="invoice-company-details-section">
                        <div class="invoice-company-details-section__company-name">
                            <span>${companyName}</span>
                        </div>
                        <div class="invoice-company-details-section__company-details">
                            <span>${ownerName}</span>
                            <span>${address}</span>
                            <span>${telephoneNumberTemplate} ${faxTelephoneNumberTemplate}</span>
                            <span>${tinTemplate}</span>
                        </div>
                        <div class="invoice-company-details-section__delivery-details">
                            <div class="deliver-shipment-section">
                                Deliver/Ship to: <br> <strong>${deliverShipTo}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="invoice-tracking-section">
                        <div class="invoice-tracking-section__content">
                            <div class="invoice-tracking-property-transaction-no">
                                Transaction No.
                            </div>
                            <div class="invoice-tracking-value-transaction-no">
                                ${transaction.invoiceNo}
                            </div>
                            <div class="invoice-tracking-property-date">
                                Date
                            </div>
                            <div class="invoice-tracking-value-date">
                                ${DateFormatter.format(transaction.transactionDate, 'MM/DD/YYYY')}
                            </div>
                        </div>
                    </div>
                    <div class="invoice-product-list-section">
                        <table class="invoice-product-list-section__product-list-table">
                            <thead>
                                <tr>
                                    <th class="product-description-column">Product Description</th>
                                    <th class="product-quantity-column">Quantity</th>
                                    <th class="product-unit-column">Unit</th>
                                    <th class="product-unit-price-column">Unit Price</th>
                                    <th class="product-amount-column">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                              ${this.generateProductTransactionList(transaction.productTransactions)}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td class="footer-product-list-count">${transaction.productTransactions.length}</td>
                                    <td class="footer-product-quantity-count">${transaction.productTransactions.reduce((acc, transaction) => acc + transaction.quantity, 0)}</td>
                                    <td></td>
                                    <td></td>
                                    <td class="product-total-amount-column">${NumberFormatter.formatCurrency(transaction.total, false)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="invoice-received-info-section">
                        <div class="invoice-received-info-section__footer-text">
                            ${generalSettings.invoiceFooterText}
                        </div>
                        <div class="invoice-received-info-section__footer-text-2">
                            ${generalSettings.invoiceFooterText1}
                        </div>
                    </div>
                    <div class="invoice-summary-amount-section">
                        <div class="invoice-summary-amount-section__details">
                            <span class="property">Vatable Amount: </span>
                            <span class="value">${NumberFormatter.formatCurrency(transaction.vatableAmount, false)}</span>
                        </div>
                        <div class="invoice-summary-amount-section__details">
                            <span class="property">Value Added Tax: </span>
                            <span class="value">${NumberFormatter.formatCurrency(transaction.valueAddedTax, false)}</span>
                        </div>
                        <div class="invoice-summary-amount-section__details">
                            <span class="property">Amount Sales: </span>
                            <span class="value">${NumberFormatter.formatCurrency(transaction.netTotal, false)}</span>
                        </div>
                        ${badOrderTemplate}
                        ${discountTemplate}
                        <div class="invoice-summary-amount-section__details invoice-summary-amount-section__total-payable-amount">
                            <span class="property">Total Payable: </span>
                            <span class="value">${NumberFormatter.formatCurrency(transaction.netTotal, false)}</span>
                        </div>
                    </div>
                </div>
              </body>
            </html>

            <style>
              .receipt-template {
                  display: grid;
                  grid-template-columns: 1.8fr 1fr;
                  grid-template-rows: 200px minmax(100px, auto) 200px;
                  grid-template-areas: "invoice-company-details-section invoice-tracking-section" "invoice-product-list-section invoice-product-list-section" "invoice-received-info-section invoice-summary-amount-section";
              }

              .invoice-company-details-section {
                  grid-area: invoice-company-details-section;
                  display: flex;
                  flex-direction: column;
                  gap: 1em;
              }

              .invoice-tracking-section {
                  grid-area: invoice-tracking-section;
              }

              .invoice-tracking-section__content {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  grid-template-rows: repeat(2, 25px);
                  grid-template-areas: "invoice-tracking-property-transaction-no invoice-tracking-value-transaction-no" "invoice-tracking-property-date invoice-tracking-value-date";
                  font-size: 15px;
              }

              .invoice-tracking-section__content .invoice-tracking-property-transaction-no {
                  grid-area: invoice-tracking-property-transaction-no;
                  font-weight: bold;
              }

              .invoice-tracking-section__content .invoice-tracking-value-transaction-no {
                  grid-area: invoice-tracking-value-transaction-no;
                  text-align: right;
              }

              .invoice-tracking-section__content .invoice-tracking-property-date {
                  grid-area: invoice-tracking-property-date;
                  font-weight: bold;
              }

              .invoice-tracking-section__content .invoice-tracking-value-date {
                  grid-area: invoice-tracking-value-date;
                  text-align: right;
              }

              .invoice-product-list-section {
                  grid-area: invoice-product-list-section;
                  width: 100%;
                  margin-bottom: 2em;
              }

              .invoice-company-details-section__company-name {
                  font-size: 25px;
                  font-weight: bold;
              }

              .invoice-company-details-section__company-details {
                  display: flex;
                  flex-direction: column;
                  font-style: italic;
              }

              .invoice-company-details-section__delivery-details {
                  flex: 1;
                  width: 70%
              }

              .invoice-received-info-section {
                  grid-area: invoice-received-info-section;
                  width: 90%;
                  display: flex;
                  flex-direction: column;
                  gap: 1em;
                  font-style: italic;
                  font-weight: bold;
              }

              .invoice-received-info-section__footer-text {
                  border: 1px solid;
                  padding: 10px;
              }

              .invoice-received-info-section__footer-text-2 {
                  border: 1px solid;
                  padding: 10px;
                  flex: 1;
              }

              .invoice-summary-amount-section {
                  grid-area: invoice-summary-amount-section;
                  display: flex;
                  flex-direction: column;
                  gap: 0.8em;
                  justify-content: end;
                  font-size: 15px;
              }

              .invoice-summary-amount-section__details {
                  display: flex;
              }

              .invoice-summary-amount-section__total-payable-amount {
                  font-weight: bold;
              }

              .invoice-summary-amount-section__total-payable-amount .value {
                  border: 1px solid;
              }

              .invoice-summary-amount-section__details .property {
                  width: 150px;
              }

              .invoice-summary-amount-section__details .value {
                  flex: 1;
                  text-align: right;
              }

              .invoice-product-list-section__product-list-table {
                  border-collapse: collapse;
                  width: 100%;
              }

              .invoice-product-list-section__product-list-table .product-unit-column {
                padding-left: 5px;
              }

              .invoice-product-list-section__product-list-table thead th {
                  border-bottom: 2px solid black;
                  border-top: 2px solid black;
                  text-align: left;
              }

              .invoice-product-list-section__product-list-table tfoot {
                  border-bottom: 2px solid black;
                  border-top: 2px solid black;
                  text-align: left;
              }

              .invoice-product-list-section__product-list-table td {
                  padding: 0.3em 0 0.3em;
              }

              .invoice-product-list-section__product-list-table .product-quantity-column,
              .invoice-product-list-section__product-list-table .product-unit-price-column,
              .invoice-product-list-section__product-list-table .product-amount-column {
                  text-align: right;
              }

              .invoice-product-list-section__product-list-table .footer-product-quantity-count {
                  text-align: right;
                  font-weight: bold;
              }

              .invoice-product-list-section__product-list-table .footer-product-list-count {
                  text-align: center;
                  font-weight: bold;
              }

              .invoice-product-list-section__product-list-table .product-total-amount-column {
                  text-align: right;
                  font-weight: bold;
              }
            </style>
    `;

    return element;
  }

  private generateProductTransactionList(productTransaction: Array<ProductTransaction>) {
    let template = ``;

    for (let i = 0; i < productTransaction.length; i++) {
      template += `
        <tr>
          <td class="product-description-column">${productTransaction[i].product.name}</td>
          <td class="product-quantity-column">${productTransaction[i].quantity}</td>
          <td class="product-unit-column">${productTransaction[i].product.productUnit.name}</td>
          <td class="product-unit-price-column">${NumberFormatter.formatCurrency(productTransaction[i].price, false)}</td>
          <td class="product-amount-column">${NumberFormatter.formatCurrency(productTransaction[i].price * productTransaction[i].quantity, false)}</td>
        </tr>
      `;
    }

    return template;
  }
}
