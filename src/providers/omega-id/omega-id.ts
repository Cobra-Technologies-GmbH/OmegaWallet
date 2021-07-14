import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { Logger } from '../../providers/logger/logger';

// providers
import { Device } from '@ionic-native/device';
import * as bitauthService from 'bitauth';
import { User } from '../../models/user/user.model';
import { AppIdentityProvider } from '../app-identity/app-identity';
import { InAppBrowserProvider } from '../in-app-browser/in-app-browser';
import { Network, PersistenceProvider } from '../persistence/persistence';
import { PlatformProvider } from '../platform/platform';

export interface OmegaUserInfoType {
	username: string;
	givenName: string;
	familyName: string;
	objectId: string;
};

type customJwtPayload = JwtPayload & { name: string, given_name: string, family_name: string, oid: string }

interface CustomToken
{
	access_token: string,
	token_type: string
}

@Injectable()
export class OmegaIdProvider {
  private NETWORK: string;
  private OMEGA_API_URL: string;
  private deviceName = 'unknown device';

  private config =
  {
    clientId: "84375cab-362c-4265-8b08-c3a824fbc280",
	authEndpoint: "https://cobraidentity.b2clogin.com/cobraidentity.onmicrosoft.com/B2C_1_AppLink/oauth2/v2.0/token",
    grantType: "password",
	scope: "openid 84375cab-362c-4265-8b08-c3a824fbc280 offline_access"
  };

  constructor(
    private http: HttpClient,
    private appIdentityProvider: AppIdentityProvider,
    private logger: Logger,
    private device: Device,
    private platformProvider: PlatformProvider,
    private persistenceProvider: PersistenceProvider,
    private iab: InAppBrowserProvider,
  )
  {
    this.logger.debug('OmegaProvider initialized');
    if (this.platformProvider.isElectron)
    {
      this.deviceName = this.platformProvider.getOS().OSName;
    }
    else if (this.platformProvider.isCordova)
    {
      this.deviceName = this.device.model;
    }
  }

	private getPromise(username: string, password: string): Promise<CustomToken>
	{
		return new Promise((resolve, reject) =>
		{
			let body: string = `client_id=${encodeURI(this.config.clientId)}&scope=${encodeURI(this.config.scope)}&username=${encodeURI(username)}&password=${encodeURI(password)}&grant_type=${encodeURI(this.config.grantType)}`;
			
			let headers: HttpHeaders = new HttpHeaders()
			.append("Content-Type", "application/x-www-form-urlencoded")
			.append("Accept", "application/json; charset=utf-8");

			this.http.post(this.config.authEndpoint, body, { headers, responseType: 'json' }).subscribe(
				data => { resolve(data as CustomToken); },
				data => { reject(data); }
			);
		});
	}

	

	private getDecodedAccessToken(token: string): customJwtPayload | null
	{
		try
		{
			let result : customJwtPayload = jwt_decode<customJwtPayload>(token);
			const now = Date.now().valueOf() / 1000
			if(result.exp && now >= result.exp)
			{
				this.logger.warn("OmegaId - Token expired");
				return null;
			}
			if(result.nbf && now + 60 < result.nbf)
			{
				this.logger.warn("OmegaId - Token not valid yet");
				return null;
			}
			return result;
		}
		catch (error)
		{
			this.logger.error("OmegaId - Token decode error");
			return null;
		}
	}

  public async linkAccount(username: string, password:string): Promise<OmegaUserInfoType | null>
  {
	try {
		let http_promise: Promise<CustomToken> = this.getPromise(username, password);
		let response_body: CustomToken = await http_promise;
		this.logger.info("OmegaId - Login Success");
		this.logger.debug(response_body);
		
		let token : customJwtPayload | null = this.getDecodedAccessToken(response_body.access_token as string);
		if (!token) return null;
		return {
			username: token.name,
			givenName: token.given_name,
			familyName: token.family_name,
			objectId: token.oid
		};
	} catch (error) {
		this.logger.error(error);
	}
    return null;
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

            // if (experiments && experiments.includes('NADebitCard')) {
            //   this.persistenceProvider.setCardExperimentFlag('enabled');
            //   this.events.publish('experimentUpdateStart');
            // }

            await Promise.all([
              this.persistenceProvider.setOmegaIdPairingToken(
                network,
                token.data
              ),
              // this.persistenceProvider.setOmegaIdUserInfo(network, data),
              // this.persistenceProvider.setOmegaAccount(network, data)
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
  userShopperToken ?: string
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

  public async refreshUserInfo()
  {
    this.logger.debug('Refreshing user info');
    const userInfo = await this.apiCall('getBasicInfo');
    const network = Network[this.getEnvironment().network];
    await this.persistenceProvider.setOmegaIdUserInfo(network, userInfo);
  }

  public async unlockInvoice(invoiceId: string): Promise < string > {
  const isPaired = !!(await this.persistenceProvider.getOmegaIdPairingToken(
    Network[this.NETWORK]
  ));
  if(!isPaired) return 'pairingRequired';

  const tokens = await this.apiCall('getProductTokens');
  const { token } = tokens.find(t => t.facade === 'userShopper');
  if(!token) return 'userShopperNotFound';

  const { meetsRequiredTier } = await this.apiCall(
    'unlockInvoice',
    { invoiceId },
    token
  );
  if(!meetsRequiredTier) return 'tierNotMet';

  return 'unlockSuccess';
}

getAppIdentity(): Promise < { pub: string; priv: string } > {
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
