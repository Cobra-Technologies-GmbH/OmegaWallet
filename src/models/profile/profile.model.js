export class Profile {
    constructor() {
        this.version = '2.0.0';
    }
    static create() {
        let x = new Profile();
        x.createdOn = Date.now();
        x.credentials = [];
        x.disclaimerAccepted = false;
        x.checked = {};
        return x;
    }
    static fromObj(obj) {
        if (!obj || typeof obj != 'object') {
            throw new Error('Wrong params at Profile.fromObj: ' + obj);
        }
        let x = new Profile();
        x.createdOn = obj.createdOn;
        x.credentials = obj.credentials || [];
        x.disclaimerAccepted = obj.disclaimerAccepted || false;
        x.checked = obj.checked || {};
        x.checkedUA = obj.checkedUA;
        if (x.credentials[0] && typeof x.credentials[0] != 'object')
            throw new Error('credentials should be an array of objects');
        return x;
    }
    hasWallet(walletId) {
        for (let i in this.credentials) {
            let c = this.credentials[i];
            if (c.walletId == walletId)
                return true;
        }
        return false;
    }
    isChecked(ua, walletId) {
        return !!(this.checkedUA == ua && this.checked[walletId]);
    }
    isDeviceChecked(ua) {
        return this.checkedUA == ua;
    }
    setChecked(ua, walletId) {
        if (this.checkedUA != ua) {
            this.checkedUA = ua;
            this.checked = {};
        }
        this.checked[walletId] = true;
        this.dirty = true;
    }
    addWallet(credentials) {
        if (!credentials.walletId)
            throw new Error('credentials must have .walletId');
        if (this.hasWallet(credentials.walletId))
            return false;
        this.credentials.push(credentials);
        this.dirty = true;
        return true;
    }
    updateWallet(credentials) {
        if (!credentials.walletId)
            throw new Error('credentials must have .walletId');
        if (!this.hasWallet(credentials.walletId))
            return false;
        this.credentials = this.credentials.map(c => {
            if (c.walletId != credentials.walletId) {
                return c;
            }
            else {
                return credentials;
            }
        });
        this.dirty = true;
        return true;
    }
    deleteWallet(walletId) {
        if (!this.hasWallet(walletId))
            return false;
        this.credentials = this.credentials.filter(c => {
            return c.walletId != walletId;
        });
        this.dirty = true;
        return true;
    }
    acceptDisclaimer() {
        this.disclaimerAccepted = true;
        this.dirty = true;
    }
}
//# sourceMappingURL=profile.model.js.map