// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import { __awaiter } from "tslib";
// tslint:disable:ordered-imports
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
// tslint:enable:ordered-imports
import { DecimalPipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';
import { ActionSheetController, AlertController, App, Config, DeepLinker, DomController, Events, Form, GestureController, Haptic, IonicModule, Keyboard, LoadingController, MenuController, ModalController, NavController, NavParams, Platform, ToastController, ViewController } from 'ionic-angular';
import { ActionSheetControllerMock, AlertControllerMock, ConfigMock, HapticMock, LoadingControllerMock, ModalControllerMock, NavControllerMock, PlatformMock, ToastControllerMock, ViewControllerMock } from 'ionic-mocks';
import { AndroidFingerprintAuthMock } from '@ionic-native-mocks/android-fingerprint-auth';
import { FileMock } from '@ionic-native-mocks/file';
import { QRScannerMock } from '@ionic-native-mocks/qr-scanner';
import { TouchIDMock } from '@ionic-native-mocks/touch-id';
import { AndroidFingerprintAuth } from '@ionic-native/android-fingerprint-auth';
import { Device } from '@ionic-native/device';
import { File } from '@ionic-native/file';
import { QRScanner } from '@ionic-native/qr-scanner';
import { StatusBar } from '@ionic-native/status-bar';
import { TouchID } from '@ionic-native/touch-id';
import { Subject } from 'rxjs/Subject';
import { AppProvider } from './providers/app/app';
import { PersistenceProvider } from './providers/persistence/persistence';
import { PlatformProvider } from './providers/platform/platform';
import { ThemeProvider } from './providers/theme/theme';
import { KeysPipe } from './pipes/keys';
import { OrderByPipe } from './pipes/order-by';
import { SatToFiatPipe } from './pipes/satToFiat';
import { SatToUnitPipe } from './pipes/satToUnit';
import { ShortenedAddressPipe } from './pipes/shortened-address';
import { DomProvider, Logger } from './providers';
import { ProvidersModule } from './providers/providers.module';
import { ImageLoader, IonicImageLoader } from 'ionic-image-loader';
import * as appTemplate from './../app-template/bitpay/appConfig.json';
import { ActionSheetComponent } from './components/action-sheet/action-sheet';
import { EncryptPasswordComponent } from './components/encrypt-password/encrypt-password';
import { InfoSheetComponent } from './components/info-sheet/info-sheet';
import { DomProviderMock } from './providers/dom/dom.mock';
import { LoggerMock } from './providers/logger/logger.mock';
export class NavParamsMock {
    constructor() {
        this.data = {};
    }
    get(_) {
        if (NavParamsMock.returnParam) {
            return NavParamsMock.returnParam;
        }
        return 'default';
    }
    static setParams(value) {
        NavParamsMock.returnParam = value;
    }
}
NavParamsMock.returnParam = null;
// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
const baseImports = [
    FormsModule,
    HttpClientTestingModule,
    IonicModule,
    IonicImageLoader.forRoot(),
    ReactiveFormsModule,
    TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
    })
];
const angularProviders = [TranslateService];
const ionicProviders = [
    App,
    DomController,
    Events,
    Form,
    Keyboard,
    MenuController,
    NavController,
    ImageLoader,
    {
        provide: Platform,
        useFactory: () => {
            const instance = PlatformMock.instance();
            instance.is.and.returnValue(false);
            instance.resume = new Subject();
            return instance;
        }
    },
    { provide: Config, useFactory: () => ConfigMock.instance() },
    { provide: DeepLinker, useFactory: () => ConfigMock.instance() },
    {
        provide: ActionSheetController,
        useFactory: () => ActionSheetControllerMock.instance()
    },
    {
        provide: ModalController,
        useFactory: () => ModalControllerMock.instance()
    },
    {
        provide: AlertController,
        useFactory: () => AlertControllerMock.instance()
    },
    {
        provide: Haptic,
        useFactory: () => HapticMock.instance()
    },
    {
        provide: LoadingController,
        useFactory: () => LoadingControllerMock.instance()
    },
    {
        provide: NavController,
        useFactory: () => NavControllerMock.instance()
    },
    {
        provide: ToastController,
        useFactory: () => ToastControllerMock.instance()
    },
    {
        provide: ViewController,
        useFactory: () => ViewControllerMock.instance()
    },
    { provide: DomProvider, useClass: DomProviderMock },
    { provide: Device, useClass: Device },
    { provide: File, useClass: FileMock },
    { provide: QRScanner, useClass: QRScannerMock },
    { provide: StatusBar, useClass: StatusBar },
    { provide: TouchID, useClass: TouchIDMock },
    {
        provide: AndroidFingerprintAuth,
        useClass: AndroidFingerprintAuthMock
    },
    {
        provide: NavParams,
        useClass: NavParamsMock
    }
];
const baseProviders = [
    ...angularProviders,
    ...ionicProviders,
    { provide: Logger, useClass: LoggerMock }
];
export class TestUtils {
    static beforeEachCompiler(components) {
        return TestUtils.configureIonicTestingModule(components)
            .compileComponents()
            .then(() => {
            const fixture = TestBed.createComponent(components[0]);
            return {
                fixture,
                instance: fixture.debugElement.componentInstance
            };
        });
    }
    static configureIonicTestingModule(components) {
        return TestBed.configureTestingModule({
            declarations: [...components],
            imports: baseImports,
            providers: [
                ...baseProviders,
                PersistenceProvider,
                PlatformProvider,
                ThemeProvider
            ]
        });
    }
    static configurePageTestingModule(components, otherParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const providers = (otherParams && otherParams.providers) || [];
            yield TestBed.configureTestingModule({
                declarations: [
                    ...components,
                    KeysPipe,
                    OrderByPipe,
                    SatToFiatPipe,
                    SatToUnitPipe,
                    ShortenedAddressPipe,
                    InfoSheetComponent,
                    ActionSheetComponent
                ],
                imports: [...baseImports, MomentModule, ProvidersModule],
                schemas: [NO_ERRORS_SCHEMA],
                providers: [
                    ...baseProviders,
                    AppProvider,
                    DecimalPipe,
                    KeysPipe,
                    OrderByPipe,
                    SatToFiatPipe,
                    SatToUnitPipe,
                    ShortenedAddressPipe,
                    GestureController,
                    PlatformProvider,
                    ThemeProvider,
                    ...providers
                ]
            })
                .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: [InfoSheetComponent, ActionSheetComponent]
                }
            })
                .compileComponents();
            const appProvider = TestBed.get(AppProvider);
            spyOn(appProvider, 'getAppInfo').and.returnValue(Promise.resolve(appTemplate));
            spyOn(appProvider, 'getServicesInfo').and.returnValue(Promise.resolve({}));
            yield appProvider.load();
            const fixture = TestBed.createComponent(components[0]);
            return {
                fixture,
                instance: fixture.debugElement.componentInstance,
                testBed: TestBed
            };
        });
    }
    static configureProviderTestingModule(providerOverrides = []) {
        TestBed.configureTestingModule({
            imports: [...baseImports, ProvidersModule],
            providers: [...baseProviders, ...providerOverrides],
            declarations: [
                EncryptPasswordComponent,
                InfoSheetComponent,
                ActionSheetComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [
                    EncryptPasswordComponent,
                    ActionSheetComponent,
                    InfoSheetComponent
                ]
            }
        })
            .compileComponents();
        return TestBed;
    }
    // http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
    static eventFire(el, etype) {
        if (el.fireEvent) {
            el.fireEvent('on' + etype);
        }
        else {
            const evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }
}
//# sourceMappingURL=test.js.map