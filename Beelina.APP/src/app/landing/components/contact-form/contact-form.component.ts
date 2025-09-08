import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactFormService } from '../../services/contact-form.service';
import { ContactFormInput } from '../../interfaces/contact-form.interface';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {

  contactForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private contactFormService: ContactFormService
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      company: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s\-\(\)]+$/)]],
      businessType: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      // Prepare the contact form data
      const formData: ContactFormInput = {
        firstName: this.contactForm.get('firstName')?.value,
        lastName: this.contactForm.get('lastName')?.value,
        emailAddress: this.contactForm.get('email')?.value,
        companyName: this.contactForm.get('company')?.value,
        phoneNumber: this.contactForm.get('phone')?.value,
        businessType: this.contactForm.get('businessType')?.value,
        message: this.contactForm.get('message')?.value
      };

      // Call the GraphQL service
      this.contactFormService.sendContactForm(formData)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.snackBar.open(
                result.message || 'Thank you for your interest! We\'ll get back to you within 24 hours.',
                'Close',
                {
                  duration: 5000,
                  panelClass: ['success-snackbar']
                }
              );
              this.contactForm.reset();
            } else {
              this.snackBar.open(
                result.errorMessage || 'Failed to send your message. Please try again.',
                'Close',
                {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                }
              );
            }
          },
          error: (error) => {
            console.error('Contact form submission error:', error);
            this.snackBar.open(
              'An unexpected error occurred. Please try again later.',
              'Close',
              {
                duration: 5000,
                panelClass: ['error-snackbar']
              }
            );
          }
        });

    } else {
      this.markFormGroupTouched();
      this.snackBar.open(
        'Please fill in all required fields correctly.',
        'Close',
        {
          duration: 3000,
          panelClass: ['error-snackbar']
        }
      );
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }

    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters`;
    }

    if (control?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }

    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      company: 'Company',
      phone: 'Phone',
      businessType: 'Business type',
      message: 'Message'
    };

    return displayNames[fieldName] || fieldName;
  }

}
