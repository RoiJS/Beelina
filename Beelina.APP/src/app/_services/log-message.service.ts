import { Injectable, inject } from '@angular/core';

import { Apollo, gql } from 'apollo-angular';

import { LogLevelEnum } from '../_enum/log-type.enum';
import { NetworkService } from './network.service';
import { of } from 'rxjs';

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
  networkService = inject(NetworkService);

  constructor() { }

  logMessage(logLevel: LogLevelEnum, message: string) {
    if (!this.networkService.isOnline) {
      console.warn(`Log message not sent due to offline mode: ${message}`);
      return of();
    }

    return this.apollo
      .mutate({
        mutation: LOG_MESSAGE,
        variables: {
          logLevel,
          message
        },
      }).subscribe(() => {
        console.info('Log message sent.');
      });
  }
}
