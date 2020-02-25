const config = require('norska-config');
const firost = require('firost');
const path = require('path');
const _ = require('golgoth/lib/lodash');
const pMap = require('golgoth/lib/pMap');

module.exports = {
  __cache: {},
  /**
   * Check if the cache is currently filled
   * @returns {boolean} True if data cached, false otherwise
   **/
  hasCache() {
    return !_.chain(this)
      .get('__cache')
      .keys()
      .isEmpty()
      .value();
  },
  /**
   * Return the current cache
   * @returns {object} The cache object
   **/
  getAll() {
    return this.__cache;
  },
  /**
   * Init the module, filling the cache if needed.
   * Won't do anything if called more than once
   **/
  async init() {
    if (this.hasCache()) {
      return;
    }
    await this.updateCache();
  },
  // Force updating
  async updateCache() {
    this.__cache = {};
    const files = await firost.glob(config.fromPath('_data/**/*.{js,json}'));
    await pMap(files, async filepath => {
      const value = await this.read(filepath);
      const key = await this.key(filepath);
      _.set(this.__cache, key, value);
    });
  },
  /**
   * Read a .json or .js file from disk and return its content
   * Will parse JSON and require JavaScript. If JavaScript export a method, it
   * will be called and its return value used instead
   * @param {string} filepath Path to the data file to read
   * @returns {*} Exported value
   **/
  async read(filepath) {
    const extname = path.extname(filepath);
    switch (extname) {
      case '.json':
        return await firost.readJson(filepath);
      case '.js': {
        const content = await firost.require(filepath, { forceReload: true });
        return _.isFunction(content) ? await content() : content;
      }
      default:
        return null;
    }
  },
  /**
   * Convert a filepath to a data file into a dot-separated object path notation
   * @param {string} filepath Path to a data file
   * @returns {string} dot-separated path
   **/
  key(filepath) {
    const basedir = config.fromPath('_data');
    const relativePath = path.relative(basedir, filepath);
    const extname = path.extname(filepath);
    const relativeBasename = _.replace(
      relativePath,
      new RegExp(`${extname}$`),
      ''
    );
    return _.replace(relativeBasename, /\//g, '.');
  },
  clearCache() {
    this.__cache = {};
  },
};