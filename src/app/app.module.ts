import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicImageLoader } from 'ionic-image-loader';
import { MarkdownModule } from 'ngx-markdown';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';

import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  Config,
  IonicApp,
  IonicErrorHandler,
  IonicModule
} from 'ionic-angular';

/* Modules */
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateDefaultParser,
  TranslateLoader,
  TranslateModule,
  TranslateParser
} from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';
import { NgxBarcodeModule } from 'ngx-barcode';
import { NgxQRCodeModule } from 'ngx-qrcode2';

/* Copay App */
import env from '../environments';
import { CopayApp } from './app.component';

import { PAGES } from './../pages/pages';

/* Pipes */
import { FiatToUnitPipe } from '../pipes/fiatToUnit';
import { FormatCurrencyPipe } from '../pipes/format-currency';
import { KeysPipe } from '../pipes/keys';
import { OrderByPipe } from '../pipes/order-by';
import { SatToFiatPipe } from '../pipes/satToFiat';
import { SatToUnitPipe } from '../pipes/satToUnit';
import { ShortenedAddressPipe } from '../pipes/shortened-address';

/* Directives */
import { Animate } from '../directives/animate/animate';
import { CopyToClipboard } from '../directives/copy-to-clipboard/copy-to-clipboard';
import { ExternalizeLinks } from '../directives/externalize-links/externalize-links';
import { FixedScrollBgColor } from '../directives/fixed-scroll-bg-color/fixed-scroll-bg-color';
import { IonContentBackgroundColor } from '../directives/ion-content-background-color/ion-content-background-color';
import { IonMask } from '../directives/ion-mask/ion-mask';
import { LongPress } from '../directives/long-press/long-press';
import { NavbarBg } from '../directives/navbar-bg/navbar-bg';
import { NoLowFee } from '../directives/no-low-fee/no-low-fee';
import { RevealAtScrollPosition } from '../directives/reveal-at-scroll-pos/reveal-at-scroll-pos';
import { ScrolledIntoView } from '../directives/scrolled-into-view/scrolled-into-view';
import { WideHeaderBarButton } from '../pages/templates/wide-header-page/wide-header-bar-button';

/* Components */
import { COMPONENTS } from '../components/components';

/* Providers */
import { LanguageLoader } from '../providers/language-loader/language-loader';
import { ProvidersModule } from '../providers/providers.module';

/* Azure AD B2C */
import { Configuration } from 'msal';
import { 
  MsalModule,
  MsalInterceptor,
  MSAL_CONFIG,
  MSAL_CONFIG_ANGULAR,
  MsalService,
  MsalAngularConfiguration } from '@azure/msal-angular';
import { msalConfig, msalAngularConfig } from './app-config';

export function MSALConfigFactory(): Configuration {
  return msalConfig;
}

export function MSALAngularConfigFactory(): MsalAngularConfiguration {
  return msalAngularConfig;
}

export function translateParserFactory() {
  return new InterpolatedTranslateParser();
}

export class InterpolatedTranslateParser extends TranslateDefaultParser {
  public templateMatcher: RegExp = /{\s?([^{}\s]*)\s?}/g;
}

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  public parser: TranslateParser = translateParserFactory();
  public handle(params: MissingTranslationHandlerParams) {
    return this.parser.interpolate(params.key, params.interpolateParams);
  }
}

@NgModule({
  declarations: [
    CopayApp,
    ...PAGES,
    ...COMPONENTS,
    /* Directives */
    CopyToClipboard,
    ExternalizeLinks,
    FixedScrollBgColor,
    IonContentBackgroundColor,
    IonMask,
    LongPress,
    NavbarBg,
    NoLowFee,
    Animate,
    RevealAtScrollPosition,
    ScrolledIntoView,
    WideHeaderBarButton,
    /* Pipes */
    FiatToUnitPipe,
    FormatCurrencyPipe,
    KeysPipe,
    SatToUnitPipe,
    SatToFiatPipe,
    OrderByPipe,
    ShortenedAddressPipe
  ],
  imports: [
    IonicModule.forRoot(CopayApp, {
      animate: env.enableAnimations,
      tabsHideOnSubPages: true,
      scrollPadding: false,
      tabsPlacement: 'bottom',
      backButtonIcon: 'arrow-round-back',
      backButtonText: ''
    }),
    NgxTextOverflowClampModule,
    IonicImageLoader.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    MomentModule,
    MsalModule,
    NgxBarcodeModule,
    NgxQRCodeModule,
    ProvidersModule,
    TranslateModule.forRoot({
      parser: { provide: TranslateParser, useFactory: translateParserFactory },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler
      },
      loader: {
        provide: TranslateLoader,
        useClass: LanguageLoader
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [CopayApp, ...PAGES, ...COMPONENTS],
  providers: [
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    },
    FormatCurrencyPipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_CONFIG,
      useFactory: MSALConfigFactory
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useFactory: MSALAngularConfigFactory
    },
    MsalService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor(public config: Config) {}
}
