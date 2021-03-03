import { KeyAlreadyExistsError } from './istorage';
export class RamStorage {
    constructor() {
        this.hash = {};
    }
    get(k) {
        return Promise.resolve(this.hash[k]);
    }
    set(k, v) {
        return new Promise(resolve => {
            this.hash[k] = v;
            resolve();
        });
    }
    remove(k) {
        return new Promise(resolve => {
            delete this.hash[k];
            resolve();
        });
    }
    create(k, v) {
        return this.get(k).then(data => {
            if (data)
                throw new KeyAlreadyExistsError();
            this.set(k, v);
        });
    }
}
//# sourceMappingURL=ram-storage.js.map