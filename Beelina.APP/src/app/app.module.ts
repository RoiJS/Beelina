import { NgModule, isDevMode } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { TitleStrategy } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { GraphQLModule } from './graphql.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserCardComponent } from './shared/user-card/user-card.component';
import { OfflineComponent } from './offline/offline.component';
import { SystemUpdateComponent } from './system-update/system-update.component';

import { AuthGuard } from './_guards/auth.guard';
import { AdminGuard } from './_guards/admin.guard';
import { AccessGuard } from './_guards/access.guard';

import { translateLoaderFactory } from './_loaders/translate.loader';

import { environment } from '../environments/environment';
import { ErrorInteceptorProvider } from './_services/error.interceptor.service';
import { SecretKeyInterceptorProvider } from './_services/secret-key.interceptor.service';
import { TemplatePageTitleStrategyService } from './_services/title-strategy.service';

@NgModule({
  declarations: [
    AppComponent,
    UserCardComponent,
    OfflineComponent,
    SystemUpdateComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSidenavModule,
    MatTreeModule,
    MatIconModule,
    MatRippleModule,
    MatNativeDateModule,
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
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // enabled: isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    AuthGuard,
    AdminGuard,
    AccessGuard,
    SecretKeyInterceptorProvider,
    ErrorInteceptorProvider,
    {
      provide: TitleStrategy,
      useClass: TemplatePageTitleStrategyService,
    },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 8000 } },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
