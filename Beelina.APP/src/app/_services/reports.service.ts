import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, MutationResult, gql } from 'apollo-angular';
import { catchError, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { IReportInformationQueryPayload } from '../_interfaces/payloads/ireport-information-query.payload';
import { IGenerateReportResultQueryPayload } from '../_interfaces/payloads/ireport-generate-result-query.payload';
import { ReportNotExistsError } from '../_models/errors/report-not-exists.error';
import { Report } from '../_models/report';
import { ControlValue } from '../reports/report-details/report-details.component';
import { IReportNotificationEmailOutput } from '../_interfaces/outputs/ireport-notification-email.output';
import { ReportNotificationEmailAddressResult } from '../_models/results/report-notification-emailaddress-result';
import { GenerateReportOptionEnum } from '../_enum/generate-report-option.enum';

const GET_ALL_REPORTS = gql`
  query ($filterKeyword: String) {
    reports(where: { nameTextIdentifier: { contains: $filterKeyword } }) {
      id
      nameTextIdentifier
      descriptionTextIdentifier
      moduleId
    }
  }
`;

const GET_REPORT_INFORMATION = gql`
  query ($reportId: Int!) {
    reportInformation(reportId: $reportId) {
      typename: __typename
      ... on ReportInformationResult {
        nameTextIdentifier
        descriptionTextIdentifier
        reportControlsRelations {
          id
          reportControlId
          defaultValue
          order
          allowAllOption
          onlyAvailableOnBusinessModel
          onlyAvailableOnBusinessModelForMinimumPrivilege
          reportControl {
            id
            name
            labelIdentifier
            reportParameter {
              id
              name
            }
          }
        }
      }
      ... on ReportNotExistsError {
        message
      }
    }
  }
`;

const GENERATE_REPORT = gql`
  query($reportId: Int!, $generateReportOption: GenerateReportOptionEnum!, $controlValues: [ControlValuesInput!]!) {
    generateReport(
      reportId: $reportId,
      generateReportOption: $generateReportOption,
      controlValues: $controlValues
      ) {
          generateReportOption
          reportData {
              fileName
              base64String
              contentType
          }
      }
  }
`;

const GET_REPORT_EMAIL_NOTIFICATION = gql`
  query {
    reportNotificationEmailAddress {
        emailAddress
    }
  }
`;

const UPDATE_REPORT_NOTIFICATION_EMAIL = gql`
  mutation($emailAddress: String!) {
    updateReportNotificationEmailAddress(input: { emailAddress: $emailAddress}){
        reportNotificationEmailAddress {
            id
            emailAddress
        }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(
    private apollo: Apollo,
    private translateService: TranslateService
  ) { }

  getAllReports() {
    return this.apollo
      .watchQuery({
        query: GET_ALL_REPORTS,
        variables: {
          filterKeyword: '',
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ reports: Array<Report> }>) => {
          const data = result.data.reports.map((rp: Report) => {
            const report = new Report();
            report.id = rp.id;
            report.nameTextIdentifier = rp.nameTextIdentifier;
            report.name = this.translateService.instant(
              `REPORTS_PAGE.REPORTS_INFORMATION.${rp.nameTextIdentifier}`
            );
            report.description = this.translateService.instant(
              `REPORTS_PAGE.REPORTS_INFORMATION.${rp.descriptionTextIdentifier}`
            );
            report.descriptionTextIdentifier = rp.descriptionTextIdentifier;
            report.reportClass = rp.reportClass;
            report.custom = rp.custom;

            // rp.reportControlsRelations.forEach((rr: ReportControlsRelation) => {
            //   const reportControlsRelation = new ReportControlsRelation();
            //   reportControlsRelation.reportId = rr.reportId;
            //   reportControlsRelation.reportControlId = rr.reportControlId;
            //   reportControlsRelation.order = rr.order;
            //   reportControlsRelation.defaultValue = rr.defaultValue;

            //   reportControlsRelation.reportControl.name = rr.reportControl.name;
            //   reportControlsRelation.reportControl.parentContainerName =
            //     rr.reportControl.parentContainerName;
            //   reportControlsRelation.reportControl.customCSSClasses =
            //     rr.reportControl.customCSSClasses;

            //   report.reportControlsRelations.push(reportControlsRelation);
            // });

            return report;
          });

          return data;
        })
      );
  }

  getReportInformation(reportId: number) {
    return this.apollo
      .watchQuery({
        query: GET_REPORT_INFORMATION,
        variables: {
          reportId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              reportInformation: IReportInformationQueryPayload;
            }>
          ) => {
            const data = result.data.reportInformation;
            if (data.typename === 'ReportInformationResult')
              return result.data.reportInformation;
            if (data.typename === 'ReportNotExistsError')
              throw new Error(
                (<ReportNotExistsError>result.data.reportInformation).message
              );

            return null;
          }
        )
      );
  }

  getReportNotificationEmailAddress() {
    return this.apollo
      .watchQuery({
        query: GET_REPORT_EMAIL_NOTIFICATION
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              reportNotificationEmailAddress: IReportInformationQueryPayload;
            }>
          ) => {
            return <ReportNotificationEmailAddressResult>result.data.reportNotificationEmailAddress;
          }
        )
      );
  }

  generateReport(reportId: number, generateReportOption: GenerateReportOptionEnum, controlValues: ControlValue[]) {
    return this.apollo
      .watchQuery({
        query: GENERATE_REPORT,
        variables: {
          reportId,
          generateReportOption,
          controlValues,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              generateReport: IGenerateReportResultQueryPayload;
            }>
          ) => {
            return result.data.generateReport;
          }
        ),
        catchError((error) => {
          throw new Error(error);
        })
      );
  }

  updateReportNotificationEmailAddress(emailAddress: string) {
    return this.apollo
      .mutate({
        mutation: UPDATE_REPORT_NOTIFICATION_EMAIL,
        variables: {
          emailAddress,
        },
      })
      .pipe(
        map((result: MutationResult<{ updateReportNotificationEmailAddress: IReportNotificationEmailOutput }>) => {
          const output = result.data.updateReportNotificationEmailAddress;
          const payload = output.reportNotificationEmailAddress;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }
}
