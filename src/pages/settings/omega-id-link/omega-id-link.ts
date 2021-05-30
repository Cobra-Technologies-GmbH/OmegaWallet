import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Logger, OmegaIdProvider } from '../../../providers'
import {
    Network,
    PersistenceProvider
} from '../../../providers/persistence/persistence';


import { OmegaUserInfoType } from '../../../providers/omega-id/omega-id';
import { SettingsPage } from '../settings';

@Component({
    selector: 'omega-id-link',
    templateUrl: 'omega-id-link.html'
})

export class OmegaIdLinkPage
{
    private network = Network[this.omegaIdProvider.getEnvironment().network];
    public username: string;

    constructor
    (
        private logger: Logger,
        private persistenceProvider: PersistenceProvider,
        private omegaIdProvider: OmegaIdProvider,
        private navCtrl: NavController
    )
    {}

    async ionViewDidLoad()
    {
        this.logger.info('Loaded: OmegaID Link page');
    }

    public changeUsername(username)
    {
        this.username = username;
    }

    public linkOmegaId()
    {
        this.logger.info('Linking OmegaID...');
        var omegaIdUserInfo: OmegaUserInfoType = this.omegaIdProvider.linkAccount(this.username);
        this.persistenceProvider.setOmegaIdUserInfo(this.network, omegaIdUserInfo);
        this.persistenceProvider.setOmegaAccount(this.network, omegaIdUserInfo);
        this.navCtrl.push(SettingsPage);
    }
}