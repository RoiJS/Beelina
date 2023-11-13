import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ReportControlsRelation } from 'src/app/_models/report-control-relation';
import { ReportInformationResult } from 'src/app/_models/results/report-information-result';
import { ReportsService } from 'src/app/_services/reports.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { BaseControlComponent } from '../report-controls/base-control/base-control.component';
import { componentsRegistry } from '../report-controls/components-registry';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

@Component({
  selector: 'app-report-details',
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.scss'],
})
export class ReportDetailsComponent
  extends BaseComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('container', { read: ViewContainerRef })
  container: ViewContainerRef;

  private _reportId: number;
  private _reportName: string;
  private _reportDescription: string;
  private _reportInformation: ReportInformationResult;

  private controlComponents: Array<ControlComponent> =
    new Array<ControlComponent>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private snackBarService: MatSnackBar,
    private reportService: ReportsService,
    private translateService: TranslateService
  ) {
    super();
    this._reportId = +this.activatedRoute.snapshot.paramMap.get('id');
    this._isLoading = true;
  }

  ngOnInit() {}

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

          this._reportInformation.reportControlsRelations.forEach(
            (relation: ReportControlsRelation) => {
              const componentName = `${relation.reportControl.name}Control`;
              const componentId = relation.reportControlId;
              this.attachComponentDynamically(componentId, componentName);
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

  private attachComponentDynamically(id: number, componentName: string) {
    // Attach the component to the ViewContainerRef
    const componentRef = this.container.createComponent(
      componentsRegistry[componentName]
    );
    const componentRefInstance = componentRef.instance as BaseControlComponent;

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

      this.dialogService
        .openConfirmation(
          this.translateService.instant(
            'REPORT_DETAILS_PAGE.GENERATE_REPORT_DIALOG.TITLE'
          ),
          this.translateService.instant(
            'REPORT_DETAILS_PAGE.GENERATE_REPORT_DIALOG.CONFIRM'
          )
        )
        .subscribe({
          next: (result: ButtonOptions) => {
            if (result === ButtonOptions.YES) {
              this._isLoading = true;
              this.reportService
                .generateReport(this._reportId, selectedValues)
                .subscribe(() => {
                  this._isLoading = false;
                  this.snackBarService.open(
                    this.translateService.instant(
                      'REPORT_DETAILS_PAGE.GENERATE_REPORT_DIALOG.SUCCESS_MESSAGE'
                    ),
                    this.translateService.instant('GENERAL_TEXTS.CLOSE')
                  );
                });
            }
          },
          error: () => {
            this._isLoading = false;
            this.snackBarService.open(
              this.translateService.instant(
                'REPORT_DETAILS_PAGE.GENERATE_REPORT_DIALOG.ERROR_MESSAGE'
              ),
              this.translateService.instant('GENERAL_TEXTS.CLOSE')
            );
          },
        });
    }
  }

  get reportName(): string {
    return this._reportName;
  }

  get reportDescription(): string {
    return this._reportDescription;
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
