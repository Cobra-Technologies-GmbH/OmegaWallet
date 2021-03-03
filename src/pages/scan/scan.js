import { __decorate, __metadata } from "tslib";
import { Component, VERSION } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, NavParams, Platform } from 'ionic-angular';
// providers
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { ErrorsProvider } from '../../providers/errors/errors';
import { IncomingDataProvider } from '../../providers/incoming-data/incoming-data';
import { Logger } from '../../providers/logger/logger';
import { PlatformProvider } from '../../providers/platform/platform';
import { ScanProvider } from '../../providers/scan/scan';
import env from '../../environments';
let ScanPage = class ScanPage {
    constructor(navCtrl, scanProvider, platformProvider, incomingDataProvider, events, logger, translate, navParams, platform, errorsProvider, bwcErrorProvider) {
        this.navCtrl = navCtrl;
        this.scanProvider = scanProvider;
        this.platformProvider = platformProvider;
        this.incomingDataProvider = incomingDataProvider;
        this.events = events;
        this.logger = logger;
        this.translate = translate;
        this.navParams = navParams;
        this.platform = platform;
        this.errorsProvider = errorsProvider;
        this.bwcErrorProvider = bwcErrorProvider;
        this.ngVersion = VERSION.full;
        this.hasCameras = false;
        this.incomingDataErrorHandler = err => {
            this.showErrorInfoSheet(err);
        };
        this.scannerServiceInitializedHandler = () => {
            this.logger.debug('Scanner initialization finished, reinitializing scan view...');
            this._refreshScanView();
        };
        this.isCameraSelected = false;
        this.browserScanEnabled = false;
        this.canEnableLight = true;
        this.canChangeCamera = true;
        this.scannerStates = {
            unauthorized: 'unauthorized',
            denied: 'denied',
            unavailable: 'unavailable',
            loading: 'loading',
            visible: 'visible'
        };
        this.scannerIsAvailable = true;
        this.scannerHasPermission = false;
        this.scannerIsDenied = false;
        this.scannerIsRestricted = false;
        this.canOpenSettings = false;
        this.isCordova = this.platformProvider.isCordova;
        this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: ScanPage');
        this.navCtrl.swipeBackEnabled = false;
        this.canGoBack = this.navCtrl.canGoBack();
    }
    ionViewWillLeave() {
        this.navCtrl.swipeBackEnabled = true;
        this.events.unsubscribe('incomingDataError', this.incomingDataErrorHandler);
        this.events.unsubscribe('scannerServiceInitialized', this.scannerServiceInitializedHandler);
        this.cameraToggleActive = false;
        this.lightActive = false;
        this.scanProvider.frontCameraEnabled = false;
        this.scanProvider.deactivate();
        this.unregisterBackButtonAction && this.unregisterBackButtonAction();
        this.tabBarElement.style.display = 'flex';
    }
    ionViewWillEnter() {
        this.initializeBackButtonHandler();
        this.fromAddressbook = this.navParams.data.fromAddressbook;
        this.fromImport = this.navParams.data.fromImport;
        this.fromJoin = this.navParams.data.fromJoin;
        this.fromSend = this.navParams.data.fromSend;
        this.fromMultiSend = this.navParams.data.fromMultiSend;
        this.fromSelectInputs = this.navParams.data.fromSelectInputs;
        this.fromEthMultisig = this.navParams.data.fromEthMultisig;
        this.fromConfirm = this.navParams.data.fromConfirm;
        this.fromWalletConnect = this.navParams.data.fromWalletConnect;
        if (this.canGoBack)
            this.tabBarElement.style.display = 'none';
        if (!env.activateScanner) {
            // test scanner visibility in E2E mode
            this.selectedDevice = true;
            this.hasPermission = true;
            return;
        }
        this.events.subscribe('incomingDataError', this.incomingDataErrorHandler);
        // try initializing and refreshing status any time the view is entered
        if (this.scannerHasPermission) {
            this.activate();
        }
        else {
            if (!this.scanProvider.isInitialized()) {
                this.scanProvider.gentleInitialize().then(() => {
                    this.authorize();
                });
            }
            else {
                this.authorize();
            }
        }
        this.events.subscribe('scannerServiceInitialized', this.scannerServiceInitializedHandler);
    }
    showErrorInfoSheet(error, title) {
        let infoSheetTitle = title ? title : this.translate.instant('Error');
        this.errorsProvider.showDefaultError(this.bwcErrorProvider.msg(error), infoSheetTitle, () => {
            this.activate();
        });
    }
    initializeBackButtonHandler() {
        this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
            this.closeCam();
        });
    }
    updateCapabilities() {
        let capabilities = this.scanProvider.getCapabilities();
        this.scannerIsAvailable = capabilities.isAvailable;
        this.scannerHasPermission = capabilities.hasPermission;
        this.scannerIsDenied = capabilities.isDenied;
        this.scannerIsRestricted = capabilities.isRestricted;
        this.canEnableLight = capabilities.canEnableLight;
        this.canChangeCamera = capabilities.canChangeCamera;
        this.canOpenSettings = capabilities.canOpenSettings;
    }
    handleCapabilities() {
        // always update the view
        if (!this.scanProvider.isInitialized()) {
            this.currentState = this.scannerStates.loading;
        }
        else if (!this.scannerIsAvailable) {
            this.currentState = this.scannerStates.unavailable;
        }
        else if (this.scannerIsDenied) {
            this.currentState = this.scannerStates.denied;
        }
        else if (this.scannerIsRestricted) {
            this.currentState = this.scannerStates.denied;
        }
        else if (!this.scannerHasPermission) {
            this.currentState = this.scannerStates.unauthorized;
        }
        this.logger.debug('Scan view state set to: ' + this.currentState);
    }
    _refreshScanView() {
        this.updateCapabilities();
        this.handleCapabilities();
        if (this.scannerHasPermission) {
            this.activate();
        }
    }
    activate() {
        this.scanProvider
            .activate()
            .then(() => {
            this.logger.info('Scanner activated, setting to visible...');
            this.updateCapabilities();
            this.handleCapabilities();
            this.currentState = this.scannerStates.visible;
            // resume preview if paused
            this.scanProvider.resumePreview();
            this.scanProvider.scan().then((contents) => {
                this.scanProvider.pausePreview();
                this.handleSuccessfulScan(contents);
            });
        })
            .catch(err => {
            this.logger.error(err);
        });
    }
    handleSuccessfulScan(contents) {
        if (this.canGoBack)
            this.navCtrl.pop({ animate: false });
        if (this.fromAddressbook) {
            this.events.publish('Local/AddressScan', { value: contents });
        }
        else if (this.fromImport) {
            this.events.publish('Local/BackupScan', { value: contents });
        }
        else if (this.fromJoin) {
            this.events.publish('Local/JoinScan', { value: contents });
        }
        else if (this.fromSend) {
            this.events.publish('Local/AddressScan', { value: contents });
        }
        else if (this.fromMultiSend) {
            this.events.publish('Local/AddressScanMultiSend', { value: contents });
        }
        else if (this.fromSelectInputs) {
            this.events.publish('Local/AddressScanSelectInputs', { value: contents });
        }
        else if (this.fromEthMultisig) {
            this.events.publish('Local/AddressScanEthMultisig', { value: contents });
        }
        else if (this.fromConfirm) {
            this.events.publish('Local/TagScan', { value: contents });
        }
        else if (this.fromWalletConnect) {
            this.events.publish('Local/UriScan', { value: contents });
        }
        else {
            this.navCtrl.parent.select(1); // Workaround to avoid keep camera active
            const redirParms = { activePage: 'ScanPage' };
            this.incomingDataProvider.redir(contents, redirParms);
        }
    }
    authorize() {
        this.scanProvider.initialize().then(() => {
            this._refreshScanView();
        });
    }
    attemptToReactivate() {
        this.scanProvider.reinitialize();
    }
    openSettings() {
        this.scanProvider.openSettings();
    }
    toggleLight() {
        this.scanProvider
            .toggleLight()
            .then(resp => {
            this.lightActive = resp;
        })
            .catch(error => {
            this.logger.warn('scanner error: ' + JSON.stringify(error));
        });
    }
    toggleCamera() {
        this.scanProvider
            .toggleCamera()
            .then(resp => {
            this.cameraToggleActive = resp;
            this.lightActive = false;
        })
            .catch(error => {
            this.logger.warn('scanner error: ' + JSON.stringify(error));
        });
    }
    closeCam() {
        this.navCtrl.pop({ animate: false });
    }
};
ScanPage = __decorate([
    Component({
        selector: 'page-scan',
        templateUrl: 'scan.html',
        providers: [ScanProvider]
    }),
    __metadata("design:paramtypes", [NavController,
        ScanProvider,
        PlatformProvider,
        IncomingDataProvider,
        Events,
        Logger,
        TranslateService,
        NavParams,
        Platform,
        ErrorsProvider,
        BwcErrorProvider])
], ScanPage);
export { ScanPage };
//# sourceMappingURL=scan.js.map