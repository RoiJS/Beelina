import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { GenerateReportOptionEnum } from 'src/app/_enum/generate-report-option.enum';

@Component({
  selector: 'app-report-generate-option-dialog',
  templateUrl: './report-generate-option-dialog.component.html',
  styleUrls: ['./report-generate-option-dialog.component.scss']
})
export class ReportGenerateOptionDialogComponent implements OnInit {

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ReportGenerateOptionDialogComponent>
  ) { }

  ngOnInit() {
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  download() {
    this._bottomSheetRef.dismiss({
      generateReportOption: GenerateReportOptionEnum.DOWNLOAD
    });
  }

  sendEmail() {
    this._bottomSheetRef.dismiss({
      generateReportOption: GenerateReportOptionEnum.SEND_EMAIL
    });
  }
}
