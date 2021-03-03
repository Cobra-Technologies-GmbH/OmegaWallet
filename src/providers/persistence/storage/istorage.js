import { InjectionToken } from '@angular/core';
export class KeyAlreadyExistsError extends Error {
    constructor() {
        super('Key already exists');
    }
}
export let ISTORAGE = new InjectionToken('storage');
//# sourceMappingURL=istorage.js.map