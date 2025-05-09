import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  private sanitized = inject(DomSanitizer);

  transform(value: string) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
