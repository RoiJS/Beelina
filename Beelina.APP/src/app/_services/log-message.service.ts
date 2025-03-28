import { Injectable, inject } from '@angular/core';

import { Apollo, gql } from 'apollo-angular';

import { LogLevelEnum } from '../_enum/log-type.enum';

const LOG_MESSAGE = gql`
  mutation($logLevel: LogLevel!, $message: String!) {
    logMessage(input: { logLevel: $logLevel, message: $message }) {
        boolean
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class LogMessageService {

  apollo = inject(Apollo);

  constructor() { }

  logMessage(logLevel: LogLevelEnum, message: string) {
    return this.apollo
      .mutate({
        mutation: LOG_MESSAGE,
        variables: {
          logLevel,
          message
        },
      });
  }
}
