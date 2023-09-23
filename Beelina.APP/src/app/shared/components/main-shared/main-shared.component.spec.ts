/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MainSharedComponent } from './main-shared.component';

describe('MainSharedComponent', () => {
  let component: MainSharedComponent;
  let fixture: ComponentFixture<MainSharedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainSharedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
