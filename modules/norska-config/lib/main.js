const EventEmitter = require('events');
const exists = require('firost/lib/exists');
const path = require('path');
const _ = require('golgoth/lib/lodash');

module.exports = {
  /**
   * Return absolute path to the host dir
   * @returns {string} Absolute path to host dir
   **/
  rootDir() {
    return this.get('root');
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
   * Returns a relative path between the source and the destination
   * Simulates links href and img src attributes
   * All input destination path are considered as relative to the root folder
   * where the website is deployed, but will be converted to relative paths
   * (using ../) if referenced from a file in a subfolder.
   * Paths starting with ./ or ../ are always untouched
   * @param {string} source Source file referencing the destination
   * @param {string} rawTarget Target of the link/img tag
   * @returns {string} Relative path from the source to the destination
   **/
  relativePath(source, rawTarget) {
    const target = _.trimStart(rawTarget, '/');
    const isRelative = _.startsWith(target, '.');
    if (isRelative) {
      return target;
    }

    const absoluteSourceFolder = path.dirname(path.resolve(source));
    const absoluteTarget = path.resolve(target);
    const relativeTarget = path.relative(absoluteSourceFolder, absoluteTarget);

    return relativeTarget;
  },
  /**
   * Returns the default config values
   * @returns {object} Default config object
   **/
  defaultConfig() {
    const noop = () => {};
    const root = process.cwd();
    return {
      port: 8083,
      root,
      from: './src',
      to: './dist',
      runtime: {
        jsFiles: [],
        revvFiles: {},
      },
      hooks: {
        afterHtml: noop,
      },
    };
  },
  /**
   * Return the config loaded from the root norska.config.js
   * This will require() the file, allowing the use of dynamic configuration
   * @param {string} rootPath Path to the root
   * @returns {object} Config object
   **/
  async fileConfig(rootPath = '.') {
    const configFilePath = path.resolve(rootPath, 'norska.config.js');
    if (!(await exists(configFilePath))) {
      return {};
    }
    return this.__require(configFilePath);
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
    const cliConfig = this.cliConfig(cliArgs);

    // The norska.config.js is at the root, but the root can be changed by CLI
    // arguments
    const rootPath = defaultConfig.root || cliConfig.root;
    const fileConfig = await this.fileConfig(rootPath);

    // Default config < module-specific config < norska.config.js < CLI args
    const finalConfig = _.merge(
      {},
      defaultConfig,
      modulesConfig,
      fileConfig,
      cliConfig
    );

    // Force root as absolute
    finalConfig.root = path.resolve(finalConfig.root);
    // Force from and to as absolute, relative to the root
    finalConfig.from = path.resolve(finalConfig.root, finalConfig.from);
    finalConfig.to = path.resolve(finalConfig.root, finalConfig.to);

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
  __require: require,
};
