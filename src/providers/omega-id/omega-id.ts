import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';

// providers
import { Device } from '@ionic-native/device';
import * as bitauthService from 'bitauth';
import { Config, Events } from 'ionic-angular';
import { User } from '../../models/user/user.model';
import { AppIdentityProvider } from '../app-identity/app-identity';
import { InAppBrowserProvider } from '../in-app-browser/in-app-browser';
import { Network, PersistenceProvider } from '../persistence/persistence';
import { Account, AuthResponse, Configuration, UserAgentApplication } from 'msal';
import { PlatformProvider } from '../platform/platform';
import { buildConfiguration } from 'msal/lib-commonjs/Configuration';


@Injectable()
export class OmegaIdProvider {
  private NETWORK: string;
  private OMEGA_API_URL: string;
  private deviceName = 'unknown device';
  private apiConfig = { b2cScopes: ["https://fabrikamb2c.onmicrosoft.com/helloapi/demo.read"], webApi: "https://fabrikamb2chello.azurewebsites.net/hello" };
  private loginRequest = { scopes: ["openid", ...this.apiConfig.b2cScopes] };
  private b2cPolicies = {
    names: {
        signUpSignIn: "B2C_1_SuSi",
        editProfile: "B2C_1_Edit"
    },
    authorities: {
        signUpSignIn: {
            authority: "https://cobraidentity.b2clogin.com/cobraidentity.onmicrosoft.com/B2C_1_SuSi",
        },
        editProfile: {
            authority: "https://cobraidentity.b2clogin.com/cobraidentity.onmicrosoft.com/B2C_1_Edit"
        }
    },
    authorityDomain: "cobraidentity.b2clogin.com"
  }
  private msalConfig: Configuration = {
    auth: {
      clientId: "84375cab-362c-4265-8b08-c3a824fbc280", // This is the ONLY mandatory field; everything else is optional.
      authority: this.b2cPolicies.authorities.signUpSignIn.authority, // Choose sign-up/sign-in user-flow as your default.
      knownAuthorities: [this.b2cPolicies.authorityDomain], // You must identify your tenant's domain as a known authority.
      redirectUri: "http://localhost:6420", // You must register this URI on Azure Portal/App Registration. Defaults to "window.location.href".
    },
    cache: {
      cacheLocation: "sessionStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
      storeAuthStateInCookie: false, // If you wish to store cache items in cookies as well as browser cache, set this to "true".
    }
  };
  private myConfig: Configuration = buildConfiguration(this.msalConfig);
  private myMSALObj: UserAgentApplication = new UserAgentApplication(this.myConfig);

  constructor(
    private http: HttpClient,
    private appIdentityProvider: AppIdentityProvider,
    private logger: Logger,
    private device: Device,
    private platformProvider: PlatformProvider,
    private persistenceProvider: PersistenceProvider,
    private iab: InAppBrowserProvider,
    private events: Events
  ) {
    this.logger.debug('OmegaProvider initialized');
    if (this.platformProvider.isElectron) {
      this.deviceName = this.platformProvider.getOS().OSName;
    } else if (this.platformProvider.isCordova) {
      this.deviceName = this.device.model;
    }
  }

  public signIn()
  {
    this.myMSALObj.loginPopup(this.loginRequest)
      .then(this.handleResponse)
      .catch(error => {console.log(error);});
  }

  private handleResponse(response: AuthResponse)
  {
    if (response !== null)
    {
        //setAccount(response.account);
    } else {
        //selectAccount();
    }
  }

  public selectAccount()
  {
    var currentAccounts: Account[] = this.myMSALObj.getAllAccounts();

    if (currentAccounts.length < 1)
    {
      return;
    }
  }

  public setNetwork(network: string) {
    this.NETWORK = network;
    this.OMEGA_API_URL =
      this.NETWORK == 'livenet'
        ? 'https://omega.eco'
        : 'https://test.omega.eco';
    this.logger.log(`Omega ID provider initialized with ${this.NETWORK}`);
  }

  public getEnvironment() {
    return {
      network: this.NETWORK
    };
  }

  public generatePairingToken(payload, successCallback, errorCallback) {
    const network = Network[this.getEnvironment().network];

    this.appIdentityProvider.getIdentity(network, (err, appIdentity) => {
      if (err) {
        alert(err);
        return errorCallback(err);
      }

      const { secret, code } = payload;

      const params = {
        secret,
        version: 2,
        deviceName: this.deviceName
      };

      if (code) {
        params['code'] = code;
      }

      let json: any = {
        method: 'createToken',
        params
      };

      let dataToSign = JSON.stringify(json['params']);
      let signedData = bitauthService.sign(dataToSign, appIdentity.priv);

      bitauthService.verifySignature(
        dataToSign,
        appIdentity.pub,
        signedData,

        async () => {
          json['params'].signature = bitauthService.sign(
            dataToSign,
            appIdentity.priv
          );
          json['params'].pubkey = appIdentity.pub;
          json['params'] = JSON.stringify(json.params);

          const url = `${this.OMEGA_API_URL}/api/v2/`;
          let headers = new HttpHeaders().set(
            'content-type',
            'application/json'
          );

          try {
            const token: { data?: string } = await this.http
              // @ts-ignore
              .post(url, json, { headers })
              .toPromise();

            json = {
              method: 'getBasicInfo',
              token: token.data
            };

            dataToSign = `${url}${token.data}${JSON.stringify(json)}`;

            signedData = bitauthService.sign(dataToSign, appIdentity.priv);

            headers = headers.append('x-identity', appIdentity.pub);
            headers = headers.append('x-signature', signedData);

            const user: User = await this.http
              .post(`${url}${token.data}`, json, { headers })
              .toPromise();

            if (user) {
              if (user.error) {
                errorCallback(user.error);
                return;
              }

              this.logger.debug('OmegaID: successfully paired');
              const { data } = user;
              const {
                email,
                familyName,
                givenName,
                experiments,
                incentiveLevel,
                incentiveLevelId
              } = data;

              if (experiments && experiments.includes('NADebitCard')) {
                this.persistenceProvider.setCardExperimentFlag('enabled');
                this.events.publish('experimentUpdateStart');
              }

              await Promise.all([
                this.persistenceProvider.setOmegaIdPairingToken(
                  network,
                  token.data
                ),
                this.persistenceProvider.setOmegaIdUserInfo(network, data),
                this.persistenceProvider.setOmegaAccount(network, {
                  email,
                  token: token.data,
                  familyName: familyName || '',
                  givenName: givenName || '',
                  incentiveLevel,
                  incentiveLevelId
                })
              ]);

              successCallback(data);
            }
          } catch (err) {
            alert(JSON.stringify(err));
            errorCallback(err);
          }
        },
        err => {
          errorCallback(err);
        }
      );
    });
  }

  public async apiCall(
    method: string,
    params: any = {},
    userShopperToken?: string
  ) {
    const url = `${this.OMEGA_API_URL}/api/v2/`;
    let token =
      userShopperToken ||
      (await this.persistenceProvider.getOmegaIdPairingToken(
        Network[this.NETWORK]
      ));
    const json = {
      method,
      params: JSON.stringify(params),
      token
    };
    const dataToSign = `${url}${token}${JSON.stringify(json)}`;
    const appIdentity = (await this.getAppIdentity()) as any;
    const signedData = bitauthService.sign(dataToSign, appIdentity.priv);

    let headers = new HttpHeaders().set('content-type', 'application/json');
    headers = headers.append('x-identity', appIdentity.pub);
    headers = headers.append('x-signature', signedData);

    const res: any = await this.http
      .post(`${url}${token}`, json, { headers })
      .toPromise();

    if (res && res.error) {
      throw new Error(res.error);
    }
    return (res && res.data) || res;
  }

  public async refreshUserInfo() {
    this.logger.debug('Refreshing user info');
    const userInfo = await this.apiCall('getBasicInfo');
    const network = Network[this.getEnvironment().network];
    await this.persistenceProvider.setOmegaIdUserInfo(network, userInfo);
  }

  public async unlockInvoice(invoiceId: string): Promise<string> {
    const isPaired = !!(await this.persistenceProvider.getOmegaIdPairingToken(
      Network[this.NETWORK]
    ));
    if (!isPaired) return 'pairingRequired';

    const tokens = await this.apiCall('getProductTokens');
    const { token } = tokens.find(t => t.facade === 'userShopper');
    if (!token) return 'userShopperNotFound';

    const { meetsRequiredTier } = await this.apiCall(
      'unlockInvoice',
      { invoiceId },
      token
    );
    if (!meetsRequiredTier) return 'tierNotMet';

    return 'unlockSuccess';
  }

  getAppIdentity(): Promise<{ pub: string; priv: string }> {
    const network = Network[this.getEnvironment().network];
    return new Promise((resolve, reject) => {
      this.appIdentityProvider.getIdentity(network, (err, appIdentity) => {
        if (err) {
          return reject(err);
        }
        resolve(appIdentity);
      });
    });
  }

  public async disconnectOmegaID(successCallback, errorCallback) {
    const network = Network[this.getEnvironment().network];

    // @ts-ignore
    const user: any = await this.persistenceProvider.getOmegaIdUserInfo(
      network
    );

    try {
      await Promise.all([
        this.persistenceProvider.removeOmegaIdPairingToken(network),
        this.persistenceProvider.removeOmegaIdUserInfo(network),
        this.persistenceProvider.removeAllOmegaAccounts(network)
      ]);
      this.iab.refs.card.executeScript(
        {
          code: `window.postMessage(${JSON.stringify({
            message: 'omegaIdDisconnected'
          })}, '*')`
        },
        () => {
          successCallback();
        }
      );
    } catch (err) {
      errorCallback(err);
    }
  }
}
