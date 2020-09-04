const config = require('norska-config');
const path = require('path');
const _ = require('golgoth/lib/lodash');
const pMap = require('golgoth/lib/pMap');
const glob = require('firost/glob');
const readJson = require('firost/readJson');
const firostRequire = require('firost/require');

module.exports = {
  __cache: {},
  /**
   * Check if the cache is currently filled
   * @returns {boolean} True if data cached, false otherwise
   **/
  hasCache() {
    return !_.chain(this).get('__cache').keys().isEmpty().value();
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
  async warmCache() {
    if (this.hasCache()) {
      return;
    }
    await this.updateCache();
  },
  // Force updating
  async updateCache() {
    this.__cache = {};
    const files = await glob(config.fromPath('_data/**/*.{js,json}'));
    await pMap(files, async (filepath) => {
      const value = await this.read(filepath);
      const key = await this.key(filepath);
      _.set(this.__cache, key, value);
    });

    // Add theme values if not yet set
    const themeFiles = await glob(config.themePath('_data/**/*.{js,json}'));
    await pMap(themeFiles, async (filepath) => {
      const key = await this.key(filepath);
      if (_.has(this.__cache, key)) {
        return;
      }

      const value = await this.read(filepath);
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
        return await readJson(filepath);
      case '.js': {
        const content = await this.__require(filepath, { forceReload: true });
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
    const splitPath = filepath.split('/');
    const dataIndex = _.lastIndexOf(splitPath, '_data');
    const extname = path.extname(filepath);
    return _.chain(splitPath)
      .slice(dataIndex + 1)
      .join('.')
      .replace(new RegExp(`${extname}$`), '')
      .value();
  },
  clearCache() {
    this.__cache = {};
  },
  __require: firostRequire,
};
