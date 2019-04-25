import path from 'path';
import { _ } from 'golgoth';

export default {
  // Currently held config
  config: {},
  // Default config value
  defaultConfig() {
    return {
      watch: false,
      port: 8083,
      from: './src',
      to: './dist',
      // Asset-specific config
      assetsExtensions: [
        'gif',
        'jpg',
        'png',
        'ico',
        'html',
        'svg',
        'ttf',
        'otf',
        'woff',
      ].join(','),
      // CSS specific options
      tailwindConfigFile: './node_modules/norska-css/tailwind.config.js',
    };
  },
  // Init the config singleton, by assigning the specified config, merged with
  // default options
  init(userConfig) {
    const defaultConfig = this.defaultConfig();
    const config = {
      ...defaultConfig,
      ...userConfig,
    };

    config.from = path.resolve(config.from);
    config.to = path.resolve(config.to);
    this.config = config;
  },
  // Access config keys
  get(key) {
    return _.get(this.config, key, null);
  },
  from() {
    return this.get('from');
  },
  to() {
    return this.get('to');
  },
};
