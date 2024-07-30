import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs';

import { GeneralInformation } from '../_models/general-information.model';

const GET_GENERAL_INFORMATION = gql`
  query {
    generalInformation {
      systemUpdateStatus
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GeneralSettingsService {
  constructor(private apollo: Apollo) {}

  getGeneralInformation() {
    return this.apollo
      .watchQuery({
        query: GET_GENERAL_INFORMATION,
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              generalInformation: GeneralInformation;
            }>
          ) => {
            return result.data.generalInformation;
          }
        )
      );
  }
}
