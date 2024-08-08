import { Injectable } from '@angular/core';

import * as html2pdf from 'html2pdf.js';

@Injectable({
  providedIn: 'root'
})
export class BasePrintService {

constructor() { }

  protected print(template: string) {
    const options = {
      margin: 0.8,
      filename: 'Invoice.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
      .from(template)
      .set(options)
      .toPdf()
      .output('blob')
      .then((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url);
        printWindow.focus();
        printWindow.print();
      });
  }
}
