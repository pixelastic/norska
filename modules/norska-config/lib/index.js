import path from 'path';
import { _, firost } from 'golgoth';

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
    };
  },
  // User config file
  async fileConfig() {
    const userConfigFile = path.resolve(process.cwd(), 'norska.config.js');
    if (!await firost.exist(userConfigFile)) {
      return {};
    }
    const fileConfig = require(userConfigFile);
    return fileConfig;
  },
  // Init the config singleton, by assigning the specified config, merged with
  // default options
  async init(additionalConfigs) {
    // Default generic config is first enriched with module-specific configs,
    // and can then be overwritten by user config file and user arguments
    const defaultConfig = this.defaultConfig();
    const modulesConfig = additionalConfigs.modules;
    const fileConfig = await this.fileConfig();
    const argsConfig = additionalConfigs.args;
    const config = _.merge(
      {},
      defaultConfig,
      modulesConfig,
      fileConfig,
      argsConfig
    );

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
