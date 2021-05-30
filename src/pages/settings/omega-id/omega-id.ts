import { ChangeDetectorRef, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, NavParams } from 'ionic-angular';
import { ActionSheetProvider, Logger, OmegaIdProvider, PersistenceProvider, PopupProvider } from '../../../providers'
import { InAppBrowserProvider } from '../../../providers/in-app-browser/in-app-browser';

import { OmegaUserInfoType } from '../../..//providers/omega-id/omega-id';

@Component({
    selector: 'omega-id',
    templateUrl: 'omega-id.html'
})

export class OmegaIdPage
{
    public userBasicInfo : OmegaUserInfoType;
    public network;
    public originalOmegaIdSettings: string;
    public omegaIdSettings = this.getDefaultOmegaIdSettings();

    constructor
    (
        private logger: Logger,
        private events: Events,
        private navParams: NavParams,
        private navCtrl: NavController,
        private changeDetectorRef: ChangeDetectorRef,
        private omegaIdProvider: OmegaIdProvider,
        private persistenceProvider: PersistenceProvider,
        private popupProvider: PopupProvider,
        private actionSheetProvider: ActionSheetProvider,
        private iab: InAppBrowserProvider,
        private translate: TranslateService
    )
    {}

    async ionViewDidLoad()
    {
        this.userBasicInfo = this.navParams.data;
        this.changeDetectorRef.detectChanges();
        this.network = this.omegaIdProvider.getEnvironment().network;
        this.omegaIdSettings = (await this.persistenceProvider.getOmegaIdSettings(this.network)) || this.getDefaultOmegaIdSettings();
        this.originalOmegaIdSettings = JSON.stringify(this.omegaIdSettings);
        this.logger.info('Loaded: OmegaID page');
    }

    ionViewWillLeave()
    {
        const settingsChanged = this.originalOmegaIdSettings !== JSON.stringify(this.omegaIdSettings);
        if (settingsChanged)
        {
            this.events.publish('OmegaId/SettingsChanged');
        }
    }

    getDefaultOmegaIdSettings()
    {
        return { syncGiftCardPurchases: false };
    }

    async onSettingsChange()
    {
        await this.persistenceProvider.setOmegaIdSettings(
            this.network,
            this.omegaIdSettings
        );
    }

    disconnectOmegaId()
    {
        this.popupProvider.ionicConfirm
        (
            this.translate.instant('Disconnect Omega ID'),
            this.translate.instant
            (
                'Are you sure you would like to disconnect your Omega ID?'
            )
        )
        .then
        (
            res =>
            {
                if (res)
                {
                    this.omegaIdProvider.disconnectOmegaID
                    (
                        () =>
                        {
                            const infoSheet = this.actionSheetProvider.createInfoSheet
                            (
                                'in-app-notification',
                                {
                                    title: 'Omega ID',
                                    body: this.translate.instant
                                    (
                                        'Omega ID successfully disconnected.'
                                    )
                                }
                            );
                            this.iab.refs.card.executeScript
                            (
                                {
                                    code: `window.postMessage(${JSON.stringify({message: 'omegaIdDisconnected'})}, '*')`
                                },
                                () =>
                                {
                                    infoSheet.present();
                                    setTimeout(() => 
                                    {
                                        this.navCtrl.popToRoot();
                                    }, 400);
                                }
                            );
                            this.events.publish('OmegaId/Disconnected');
                            this.events.publish('CardAdvertisementUpdate',
                            {
                                status: 'disconnected'
                            });
                        },
                        err =>
                        {
                            this.logger.log(err);
                        }
                    );
                }
            }
        );
    }
}