import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';
// providers
import { AppProvider } from '../../../providers/app/app';
import { ConfigProvider } from '../../../providers/config/config';
import { EmailNotificationsProvider } from '../../../providers/email-notifications/email-notifications';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { PersistenceProvider } from '../../../providers/persistence/persistence';
import { PlatformProvider } from '../../../providers/platform/platform';
import { PushNotificationsProvider } from '../../../providers/push-notifications/push-notifications';
// validators
import { EmailValidator } from '../../../validators/email';
let NotificationsPage = class NotificationsPage {
    constructor(navCtrl, formBuilder, configProvider, appProvider, platformProvider, pushProvider, emailProvider, externalLinkProvider, logger, persistenceProvider, translate) {
        this.navCtrl = navCtrl;
        this.formBuilder = formBuilder;
        this.configProvider = configProvider;
        this.appProvider = appProvider;
        this.platformProvider = platformProvider;
        this.pushProvider = pushProvider;
        this.emailProvider = emailProvider;
        this.externalLinkProvider = externalLinkProvider;
        this.logger = logger;
        this.persistenceProvider = persistenceProvider;
        this.translate = translate;
        this.emailForm = this.formBuilder.group({
            email: [
                '',
                Validators.compose([
                    Validators.required,
                    new EmailValidator(configProvider, emailProvider).isValid
                ])
            ]
        });
        this.isCopay = this.appProvider.info.name == 'copay' ? true : false;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: NotificationsPage');
        this.updateConfig();
    }
    updateConfig() {
        const config = this.configProvider.get();
        this.appName = this.appProvider.info.nameCase;
        this.usePushNotifications = this.platformProvider.isCordova;
        this.isIOSApp =
            this.platformProvider.isIOS && this.platformProvider.isCordova;
        this.isElectron = this.platformProvider.isElectron;
        this.pushNotifications = config.pushNotifications
            ? config.pushNotifications.enabled
            : false;
        this.desktopNotifications = config.desktopNotifications
            ? config.desktopNotifications.enabled
            : false;
        this.confirmedTxsNotifications = config.confirmedTxsNotifications
            ? config.confirmedTxsNotifications.enabled
            : false;
        this.productsUpdates = config.productsUpdates
            ? config.productsUpdates.enabled
            : false;
        this.offersAndPromotions = config.offersAndPromotions
            ? config.offersAndPromotions.enabled
            : false;
        this.emailForm.setValue({
            email: this.emailProvider.getEmailIfEnabled(config) || ''
        });
        this.emailNotifications = config.emailNotifications
            ? config.emailNotifications.enabled
            : false;
    }
    pushNotificationsChange() {
        const opts = {
            pushNotifications: { enabled: this.pushNotifications }
        };
        this.configProvider.set(opts);
        if (opts.pushNotifications.enabled)
            this.pushProvider.init();
        else
            this.pushProvider.disable();
    }
    desktopNotificationChange() {
        const opts = {
            desktopNotifications: { enabled: this.desktopNotifications }
        };
        this.configProvider.set(opts);
    }
    confirmedTxsNotificationsChange() {
        const opts = {
            confirmedTxsNotifications: {
                enabled: this.confirmedTxsNotifications
            }
        };
        this.configProvider.set(opts);
    }
    productsUpdatesChange() {
        const opts = {
            productsUpdates: {
                enabled: this.productsUpdates
            }
        };
        this.configProvider.set(opts);
        this.updateTopic(this.productsUpdates, 'productsupdates');
    }
    offersAndPromotionsChange() {
        const opts = {
            offersAndPromotions: {
                enabled: this.offersAndPromotions
            }
        };
        this.configProvider.set(opts);
        this.updateTopic(this.offersAndPromotions, 'offersandpromotions');
    }
    updateTopic(enabled, topic) {
        if (enabled)
            this.pushProvider.subscribeToTopic(topic);
        else
            this.pushProvider.unsubscribeFromTopic(topic);
    }
    emailNotificationsChange() {
        const opts = {
            enabled: this.emailNotifications,
            email: this.emailForm.value.email
        };
        this.emailProvider.updateEmail(opts);
    }
    saveEmail() {
        this.persistenceProvider.setEmailLawCompliance('accepted');
        this.emailProvider.updateEmail({
            enabled: this.emailNotifications,
            email: this.emailForm.value.email
        });
        this.navCtrl.pop();
    }
    openPrivacyPolicy() {
        const url = 'https://bitpay.com/about/privacy';
        const optIn = true;
        const title = null;
        const message = this.translate.instant('View Privacy Policy');
        const okText = this.translate.instant('Open');
        const cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
};
NotificationsPage = __decorate([
    Component({
        selector: 'page-notifications',
        templateUrl: 'notifications.html'
    }),
    __metadata("design:paramtypes", [NavController,
        FormBuilder,
        ConfigProvider,
        AppProvider,
        PlatformProvider,
        PushNotificationsProvider,
        EmailNotificationsProvider,
        ExternalLinkProvider,
        Logger,
        PersistenceProvider,
        TranslateService])
], NotificationsPage);
export { NotificationsPage };
//# sourceMappingURL=notifications.js.map