import EventEmitter from 'events';
import path from 'path';
import { _ } from 'golgoth';
import firost from 'firost';

export default {
  /**
   * Return absolute path to the host dir
   * @returns {string} Absolute path to host dir
   **/
  rootDir() {
    return process.cwd();
  },
  /**
   * Return an absolute path to a file at the root
   * @param {string} relativePath Relative path from the root
   * @returns {string} Absolute path to the file
   **/
  rootPath(relativePath = '') {
    return path.resolve(this.rootDir(), relativePath);
  },
  /**
   * Syntactic sugar to get the 'from' config key
   * @returns {string} Path to the source directory
   **/
  from() {
    return path.resolve(this.get('from'));
  },
  /**
   * Return an absolute path to a file in the source directory
   * @param {string} relativePath Relative path from the source directory
   * @returns {string} Absolute path to the file
   **/
  fromPath(relativePath = '') {
    return path.resolve(this.from(), relativePath);
  },
  /**
   * Syntactic sugar to get the 'to' config key
   * @returns {string} Path to the destination directory
   **/
  to() {
    return path.resolve(this.get('to'));
  },
  /**
   * Return an absolute path to a file in the destination directory
   * @param {string} relativePath Relative path from the destination directory
   * @returns {string} Absolute path to the file
   **/
  toPath(relativePath = '') {
    return path.resolve(this.to(), relativePath);
  },
  /**
   * Returns the default config values
   * @returns {object} Default config object
   **/
  defaultConfig() {
    return {
      port: 8083,
      from: './src',
      to: './dist',
      runtime: {
        jsFiles: [],
        revvFiles: {},
      },
    };
  },
  /**
   * Return the config loaded from the root norska.config.js
   * This will require() the file, allowing the use of dynamic configuration
   * @returns {object} Config object
   **/
  async fileConfig() {
    const configFilePath = this.rootPath('norska.config.js');
    if (!(await firost.exists(configFilePath))) {
      return {};
    }
    return firost.require(configFilePath);
  },
  /**
   * Returns named CLI arguments as a config object. This will expand
   * dot-notation keys into objects
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {object} A config object
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
   * @param {string} key Config key, accepting dot-notation
   * @param {*} defaultValue Default value if key not found
   * @returns {*} Current config value for specified key
   **/
  get(key, defaultValue) {
    return _.get(this.__config, key, defaultValue);
  },
  /**
   * Set a specific config key
   * @param {string} key Config key, accepting dot-notation
   * @param {*} value Value to store
   **/
  set(key, value) {
    // No change of value, so we stop
    if (this.get(key) === value) {
      return;
    }

    _.set(this.__config, key, value);
    this.pulse.emit('set', key, value);
  },
  /**
   * Init the config singleton by merging all possible sources of config.
   * We start with the default config and extend it with module-specific
   * configs. Users can then overwrite config with norska.config.js and CLI
   * arguments
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @param {object} modulesConfig Aggregate of module-specific configs
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
   * Internal singleton representation of the config
   **/
  __config: {},
  /**
   * Event emitter to emit/listen to events
   **/
  pulse: new EventEmitter(),
};
