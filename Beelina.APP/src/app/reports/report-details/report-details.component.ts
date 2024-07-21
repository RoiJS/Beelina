import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { ReportControlsRelation } from 'src/app/_models/report-control-relation';
import { ReportInformationResult } from 'src/app/_models/results/report-information-result';
import { BaseControlComponent } from '../report-controls/base-control/base-control.component';
import { ReportGenerateOptionDialogComponent } from './report-generate-option-dialog/report-generate-option-dialog.component';
import { ReportsService } from 'src/app/_services/reports.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { componentsRegistry } from '../report-controls/components-registry';
import { AuthService } from 'src/app/_services/auth.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { getBusinessModelEnum } from 'src/app/_enum/business-model.enum';
import { getPermissionLevelEnum } from 'src/app/_enum/permission-level.enum';
import { GenerateReportOptionEnum } from 'src/app/_enum/generate-report-option.enum';
import { ModuleEnum } from 'src/app/_enum/module.enum';
import { IGenerateReportResultQueryPayload } from 'src/app/_interfaces/payloads/ireport-generate-result-query.payload';

@Component({
  selector: 'app-report-details',
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.scss'],
})
export class ReportDetailsComponent
  extends BaseComponent
  implements OnInit, AfterViewInit {
  @ViewChild('container', { read: ViewContainerRef })
  container: ViewContainerRef;

  private _reportId: number;
  private _reportName: string;
  private _reportDescription: string;
  private _reportInformation: ReportInformationResult;

  private controlComponents: Array<ControlComponent> =
    new Array<ControlComponent>();

  private _loadingLabel: string;

  _dialogGenerateReportRef: MatBottomSheetRef<ReportGenerateOptionDialogComponent, {
    generateReportOption: GenerateReportOptionEnum
  }>;

  constructor(
    private authService: AuthService,
    private bottomSheet: MatBottomSheet,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private reportService: ReportsService,
    private translateService: TranslateService
  ) {
    super();
    this._reportId = +this.activatedRoute.snapshot.paramMap.get('id');
    this._isLoading = true;
    this._loadingLabel = this.translateService.instant('LOADER_LAYOUT.LOADING_TEXT');
  }

  ngOnInit() { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.reportService
        .getReportInformation(this._reportId)
        .subscribe((report: ReportInformationResult) => {
          this._isLoading = false;
          this._reportInformation = report;
          this._reportName = this.translateService.instant(
            `REPORTS_PAGE.REPORTS_INFORMATION.${report.nameTextIdentifier}`
          );
          this._reportDescription = this.translateService.instant(
            `REPORTS_PAGE.REPORTS_INFORMATION.${report.descriptionTextIdentifier}`
          );

          this._reportInformation.reportControlsRelations.sort((a, b) => { if (a.order > b.order) return 1; else return -1; }).forEach(
            (relation: ReportControlsRelation) => {
              const componentName = `${relation.reportControl.name}Control`;
              const componentId = relation.reportControlId;
              const controlLabelIdentifier =
                relation.reportControl.labelIdentifier;

              const userPrivileges = this.authService.user.value.getModulePrivilege(ModuleEnum.Distribution).value;
              const businessModel = this.authService.businessModel;

              const show = (!relation.onlyAvailableOnBusinessModel && !relation.onlyAvailableOnBusinessModelForMinimumPrivilege) || (businessModel === getBusinessModelEnum(relation.onlyAvailableOnBusinessModel?.toString())
                && userPrivileges >= getPermissionLevelEnum(relation.onlyAvailableOnBusinessModelForMinimumPrivilege));

              this.attachComponentDynamically(componentId, componentName, controlLabelIdentifier, show, relation.allowAllOption);
            }
          );
        });
    }, 0);
  }

  /**
   * Attaches a report cotrol component dynamically to the ViewContainerRef.
   *
   * @param {number} id - The ID of the component.
   * @param {string} componentName - The name of the component.
   */

  private attachComponentDynamically(
    id: number,
    componentName: string,
    controlLabelIdentifier: string,
    show: boolean,
    allowAllOption: boolean
  ) {
    // Attach the component to the ViewContainerRef
    const componentRef = this.container.createComponent(
      componentsRegistry[componentName]
    );
    const componentRefInstance = componentRef.instance as BaseControlComponent;
    componentRefInstance.setControlLabelIdentifier(controlLabelIdentifier);
    componentRefInstance.setControlVisibility(show);
    componentRefInstance.setAllowAllOption(show);

    this.controlComponents.push({
      id: id,
      name: componentName,
      componentInstance: componentRefInstance,
    });
  }

  /**
   * Validates the control components and returns a boolean indicating if all components are valid.
   *
   * @return {boolean} Returns true if all control components are valid, false otherwise.
   */
  validate(): boolean {
    const validationResults = this.controlComponents.map((c) =>
      c.componentInstance.validate()
    );
    return validationResults.indexOf(false) === -1;
  }

  /**
   * Generates a report if the validation is successful.
   *
   * @return {void}
   */
  generateReport() {
    if (this.validate()) {
      const selectedValues = this.controlComponents.map((c) => {
        const controlValue = new ControlValue();
        controlValue.controlId = c.id;
        controlValue.currentValue = c.componentInstance.value();
        return controlValue;
      });

      this._dialogGenerateReportRef = this.bottomSheet.open(ReportGenerateOptionDialogComponent);

      this._dialogGenerateReportRef
        .afterDismissed()
        .subscribe(
          (data: {
            generateReportOption: GenerateReportOptionEnum
          }) => {
            if (!data) return;

            this._isLoading = true;
            this._loadingLabel = this.translateService.instant('REPORT_DETAILS_PAGE.GENERATE_REPORT_DIALOG.LOADING_MESSAGE');
            this.reportService
              .generateReport(this._reportId, data.generateReportOption, selectedValues)
              .subscribe({
                next: (data: IGenerateReportResultQueryPayload) => {
                  this._isLoading = false;

                  if (data.generateReportOption === GenerateReportOptionEnum.DOWNLOAD) {
                    this.downloadReport(data);
                    this.notificationService.openSuccessNotification(this.translateService.instant(
                      'REPORT_DETAILS_PAGE.DOWNLOAD_REPORT_DIALOG.SUCCESS_MESSAGE'
                    ));
                  }

                  if (data.generateReportOption === GenerateReportOptionEnum.SEND_EMAIL) {
                    this.notificationService.openSuccessNotification(this.translateService.instant(
                      'REPORT_DETAILS_PAGE.SEND_EMAIL_REPORT_DIALOG.SUCCESS_MESSAGE'
                    ));
                  }
                },
                error: () => {
                  this._isLoading = false;
                  this.notificationService.openErrorNotification(this.translateService.instant(
                    'REPORT_DETAILS_PAGE.GENERATE_REPORT_DIALOG.ERROR_MESSAGE'
                  ));
                },
              });
          }
        );
    }
  }

  convertBase64toBlob(base64String: string, contentType: string) {
    var byteCharacters = atob(base64String);
    var byteArrays = [];

    for (var i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    var byteArray = new Uint8Array(byteArrays);

    return new Blob([byteArray], { type: contentType, });
  };

  downloadReport(data: IGenerateReportResultQueryPayload) {

    const blob = this.convertBase64toBlob(data.reportData.base64String, data.reportData.contentType);
    const url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = data.reportData.fileName; // Set the desired filename here

    // Append the anchor to the body (required for Firefox)
    document.body.appendChild(a);

    // Programmatically click the anchor to trigger the download
    a.click();

    // Remove the anchor from the document
    document.body.removeChild(a);

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(url);
  }

  get reportName(): string {
    return this._reportName;
  }

  get reportDescription(): string {
    return this._reportDescription;
  }

  get loadingLabel(): string {
    return this._loadingLabel;
  }
}

class ControlComponent {
  id: number;
  name: string;
  componentInstance: BaseControlComponent;

  constructor(name: string, component: BaseControlComponent) {
    this.name = name;
    this.componentInstance = component;
  }
}

export class ControlValue {
  controlId: number;
  currentValue: string | void;
}
