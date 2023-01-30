import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { select, Store } from '@ngrx/store';
import * as LoginActions from './store/actions';
import { authCredentialsSelector, errorSelector } from './store/selectors';

import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { ClientInformationResult } from '../_models/results/client-information-result.result';
import { ClientNotExistsError } from '../_models/errors/client-not-exists.error';


@Component({
  selector: 'app-auth-module',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth-module.component.scss'],
})
export class AuthComponent implements OnInit {
  private _authForm: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private storageService: StorageService,
    private store: Store<AppStateInterface>
  ) {
    this._authForm = this.formBuilder.group({
      company: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {}

  onSubmit() {
    const company = this.authForm.get('company').value;
    this.authService.checkCompany(company).subscribe({
      next: (client: ClientInformationResult) => {
        this.storageService.storeString('company', client.name);
        this.storageService.storeString('app-secret-token', client.dBHashName);

        const username = this.authForm.get('username').value;
        const password = this.authForm.get('password').value;

        this.store.dispatch(LoginActions.loginAction({ username, password }));

        this.store.pipe(select(authCredentialsSelector)).subscribe((auth) => {
          if (auth.accessToken) {
            this.router.navigate(['/order'], { replaceUrl: true });
          }
        });

        this.store.pipe(select(errorSelector)).subscribe((error) => {
          if (error) {
            console.error(error);
          }
        });
      },
      error: (e: ClientNotExistsError) => {
        console.error(e.message);
      },
    });
  }

  get authForm(): FormGroup {
    return this._authForm;
  }
}
