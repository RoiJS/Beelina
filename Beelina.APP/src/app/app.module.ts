import { Injectable, NgModule } from '@angular/core';
import { TitleStrategy } from '@angular/router';

import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { translateLoaderFactory } from './_loaders/translate.loader';
import { AuthGuard } from './_guards/auth.guard';

import { SecretKeyInterceptorProvider } from './_services/secret-key.interceptor.service';
import { ErrorInteceptorProvider } from './_services/error.interceptor.service';
import { GraphQLModule } from './graphql.module';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { TemplatePageTitleStrategyService } from './_services/title-strategy.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSidenavModule,
    MatTreeModule,
    MatIconModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [HttpClient],
      },
    }),
    GraphQLModule,
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
    }),
  ],
  providers: [
    AuthGuard,
    SecretKeyInterceptorProvider,
    ErrorInteceptorProvider,
    {
      provide: TitleStrategy,
      useClass: TemplatePageTitleStrategyService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
