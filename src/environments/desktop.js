import production from './prod';
/**
 * Environment: prod
 */
const env = Object.assign(Object.assign({}, production), { 
    // override for desktop:
    enableAnimations: false });
export default env;
//# sourceMappingURL=desktop.js.map