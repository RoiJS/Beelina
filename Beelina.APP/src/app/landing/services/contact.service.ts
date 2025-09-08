import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ContactInquiry } from '../models/contact-inquiry.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor() { }

  submitContactInquiry(inquiry: ContactInquiry): Observable<any> {
    // Simulate API call - replace with actual HTTP call later
    console.log('Contact inquiry submitted:', inquiry);

    return of({ success: true, message: 'Inquiry submitted successfully' }).pipe(
      delay(2000) // Simulate network delay
    );
  }
}
