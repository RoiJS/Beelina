import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppVersionService } from './app-version.service';

describe('AppVersionService', () => {
  let service: AppVersionService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [AppVersionService]
    });
    service = TestBed.inject(AppVersionService);
    translateService = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return version 1.31.3', () => {
    expect(service.appVersionNumber).toBe('1.31.3');
  });

  it('should return formatted app version with translation key', () => {
    // Mock the translate service to return a known value
    spyOn(translateService, 'instant').and.returnValue('Version');
    
    const expectedVersion = 'Version 1.31.3';
    expect(service.appVersion).toBe(expectedVersion);
    expect(translateService.instant).toHaveBeenCalledWith('SIDE_DRAWER_SECTION.FOOTER.VERSION');
  });

  it('should return copyright text with translation keys', () => {
    // Mock the translate service to return known values
    spyOn(translateService, 'instant').and.callFake((key: string) => {
      if (key === 'SIDE_DRAWER_SECTION.FOOTER.COPYRIGHT') {
        return '© 2024 Beelina';
      } else if (key === 'SIDE_DRAWER_SECTION.FOOTER.ALL_RIGHTS_RESERVED') {
        return 'All rights reserved';
      }
      return key;
    });

    const expectedCopyright = '© 2024 Beelina All rights reserved';
    expect(service.copyRightText).toBe(expectedCopyright);
  });
});