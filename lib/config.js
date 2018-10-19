import path from 'path';
import _ from 'lodash';

export default {
  // Currently held config
  config: {},
  // Default config value
  defaultConfig() {
    return {
      // Source directory
      from: './src',
      // Destination directory
      to: './dist',
      // Asset-specific config
      assets: {
        // Files to copy from source to destination
        extensions: [
          'gif',
          'jpg',
          'png',
          'ico',
          'html',
          'svg',
          'ttf',
          'otf',
          'woff',
        ],
      },
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
};
