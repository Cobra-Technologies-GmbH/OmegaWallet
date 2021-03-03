import production from './prod';
/**
 * Environment: dev
 */
const env = Object.assign(Object.assign({}, production), { 
    // override for development:
    name: 'development' });
export default env;
//# sourceMappingURL=index.js.map