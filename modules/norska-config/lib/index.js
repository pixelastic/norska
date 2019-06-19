import path from 'path';
import { _ } from 'golgoth';
import firost from 'firost';

export default {
  /**
   * Return absolute path to the host dir
   * @returns {String} Absolute path to host dir
   **/
  rootDir() {
    return process.cwd();
  },
  /**
   * Return an absolute path to a file at the root
   * @param {String} relativePath Relative path from the root
   * @returns {String} Absolute path to the file
   **/
  rootPath(relativePath = '') {
    return path.resolve(this.rootDir(), relativePath);
  },
  /**
   * Syntactic sugar to get the 'from' config key
   * @returns {String} Path to the source directory
   **/
  from() {
    return this.get('from');
  },
  /**
   * Return an absolute path to a file in the source directory
   * @param {String} relativePath Relative path from the source directory
   * @returns {String} Absolute path to the file
   **/
  fromPath(relativePath = '') {
    return path.resolve(this.from(), relativePath);
  },
  /**
   * Syntactic sugar to get the 'to' config key
   * @returns {String} Path to the destination directory
   **/
  to() {
    return this.get('to');
  },
  /**
   * Return an absolute path to a file in the destination directory
   * @param {String} relativePath Relative path from the destination directory
   * @returns {String} Absolute path to the file
   **/
  toPath(relativePath = '') {
    return path.resolve(this.to(), relativePath);
  },
  /**
   * Returns the default config values
   * @returns {Object} Default config object
   **/
  defaultConfig() {
    return {
      port: 8083,
      from: './src',
      to: './dist',
    };
  },
  /**
   * Return the config loaded from the root norska.config.js
   * This will require() the file, allowing the use of dynamic configuration
   * @returns {Object} Config object
   **/
  async fileConfig() {
    const configFilePath = this.rootPath('norska.config.js');
    if (!(await firost.exists(configFilePath))) {
      return {};
    }
    return this.__require(configFilePath);
  },
  /**
   * Returns named CLI arguments as a config object. This will expand
   * dot-notation keys into objects
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @returns {Object} A config object
   **/
  cliConfig(cliArgs) {
    const namedOptions = _.omit(cliArgs, ['_']);
    // Transform { 'foo.bar': 'baz' } into { foo: { bar: 'baz' } }
    const expandedOptions = {};
    _.each(namedOptions, (value, key) => {
      _.set(expandedOptions, key, value);
    });
    return expandedOptions;
  },
  /**
   * Return the current config value at the specified key
   * @param {String} key Config key, accepting dot-notation
   * @returns {Any} Current config value for specified key
   **/
  get(key) {
    return _.get(this.__config, key, null);
  },
  /**
   * Init the config singleton by merging all possible sources of config.
   * We start with the default config and extend it with module-specific
   * configs. Users can then overwrite config with norska.config.js and CLI
   * arguments
   * @param {Object} cliArgs CLI Argument object, as created by minimist
   * @param {Object} modulesConfig Aggregate of module-specific configs
   * @returns {Void} Set the internal __config property
   **/
  async init(cliArgs = {}, modulesConfig = {}) {
    const defaultConfig = this.defaultConfig();
    const fileConfig = await this.fileConfig();
    const cliConfig = this.cliConfig(cliArgs);

    // Default config < module-specific config < norska.config.js < CLI args
    const finalConfig = _.merge(
      {},
      defaultConfig,
      modulesConfig,
      fileConfig,
      cliConfig
    );

    // from and to path are always absolute paths
    finalConfig.from = this.rootPath(finalConfig.from);
    finalConfig.to = this.rootPath(finalConfig.to);

    this.__config = finalConfig;
  },
  /**
   * Wrapper around the raw require() call, to make it easier to mock in tests
   * @param {String} what Module identifier
   * @returns {Any} Module content
   **/
  __require(id) {
    return require(id);
  },
  /**
   * Internal singleton representation of the config
   **/
  __config: {},
};
