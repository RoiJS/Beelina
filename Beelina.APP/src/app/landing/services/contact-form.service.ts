import { Injectable } from '@angular/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContactFormInput, ContactFormResult, SendContactFormResponse } from '../interfaces/contact-form.interface';

const SEND_CONTACT_FORM = gql`
  mutation SendContactForm($contactFormInput: ContactFormInput!) {
    sendContactForm(input: { contactFormInput: $contactFormInput }) {
      contactFormResult {
        isSuccess
        message
        errorMessage
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ContactFormService {

  constructor(private apollo: Apollo) { }

  sendContactForm(contactFormInput: ContactFormInput) {
    return this.apollo.mutate({
      mutation: SEND_CONTACT_FORM,
      variables: {
        contactFormInput
      }
    }).pipe(
      map((result: MutationResult<{ sendContactForm: SendContactFormResponse }>) => {
        if (result.data.sendContactForm.contactFormResult) {
          return result.data.sendContactForm.contactFormResult;
        } else {
          // Handle case where data is null/undefined
          return {
            isSuccess: false,
            errorMessage: 'An unexpected error occurred. Please try again later.'
          };
        }
      })
    );
  }
}
