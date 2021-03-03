export class EmailValidator {
    constructor(cnf, eml) {
        EmailValidator.cnf = cnf;
        EmailValidator.eml = eml;
    }
    isValid(control) {
        let config = EmailValidator.cnf.get();
        let latestEmail = EmailValidator.eml.getEmailIfEnabled(config);
        let validEmail = /^[a-zA-Z0-9.!#$%&*+=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(control.value);
        if (validEmail && control.value != latestEmail) {
            return null;
        }
        return {
            'Invalid Email': true
        };
    }
}
//# sourceMappingURL=email.js.map