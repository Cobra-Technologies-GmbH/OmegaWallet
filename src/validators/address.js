export class AddressValidator {
    constructor(addressProvider) {
        AddressValidator.addressProvider = addressProvider;
    }
    isValid(control) {
        return AddressValidator.addressProvider.isValid(control.value)
            ? null
            : { 'Invalid Address': true };
    }
}
//# sourceMappingURL=address.js.map