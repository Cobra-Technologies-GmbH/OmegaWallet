import { ChangeDetectorRef, Component } from '@angular/core';
import { Events, NavParams } from 'ionic-angular';
import { Logger, OmegaIdProvider, PersistenceProvider } from '../../../providers'

@Component({
    selector: 'omega-id',
    templateUrl: 'omega-id.html'
})

export class OmegaIdPage
{
    public userBasicInfo;
    public network;
    public originalOmegaIdSettings: string;
    public omegaIdSettings = this.getDefaultOmegaIdSettings();

    constructor
    (
        private logger: Logger,
        private events: Events,
        private navParams: NavParams,
        private changeDetectorRef: ChangeDetectorRef,
        private omegaIdProvider: OmegaIdProvider,
        private persistenceProvider: PersistenceProvider
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
}