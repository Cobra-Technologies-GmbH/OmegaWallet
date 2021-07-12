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
	public password: string;

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

	public changePassword(password)
    {
        this.password = password;
    }

    public async linkOmegaId()
    {
        this.logger.info('Linking OmegaID...');
        try
        {
            var result: OmegaUserInfoType = await this.omegaIdProvider.linkAccount(this.username, this.password);
            this.persistenceProvider.setOmegaIdUserInfo(this.network, result);
            this.persistenceProvider.setOmegaAccount(this.network, result);
            this.navCtrl.push(SettingsPage);
        }
        catch(err)
        {
            this.logger.error('OmegaID Login failed. ' + err);
        }
    }
}
