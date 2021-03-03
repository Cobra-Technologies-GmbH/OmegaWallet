import { CurrencyProvider } from '../providers/currency/currency';
/**
 * Environment: prod
 */
const env = {
    name: 'production',
    enableAnimations: true,
    ratesAPI: new CurrencyProvider().getRatesApi(),
    activateScanner: true
};
export default env;
//# sourceMappingURL=prod.js.map