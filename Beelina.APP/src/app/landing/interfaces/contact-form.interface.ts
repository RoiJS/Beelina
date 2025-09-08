export interface ContactFormInput {
  firstName: string;
  lastName: string;
  emailAddress: string;
  companyName: string;
  phoneNumber?: string;
  businessType?: string;
  message: string;
}

export interface ContactFormResult {
  isSuccess: boolean;
  message?: string;
  errorMessage?: string;
}

export interface SendContactFormResponse {
  contactFormResult: ContactFormResult;
}
