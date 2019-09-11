import config from 'norska-config';
import firost from 'firost';
import path from 'path';
import { _, pMap } from 'golgoth';

export default {
  cacheKey: 'norska.data.sourceData',
  /**
   * Returns a nested object of all data files saved in _data
   * First call will read files from disk, subsequent calls will read from cache
   * @returns {object} Data object
   **/
  async getSourceData() {
    if (firost.cache.has(this.cacheKey)) {
      return firost.cache.read(this.cacheKey);
    }

    const files = await firost.glob(config.fromPath('_data/**/*.{js,json}'));
    const data = {};
    await pMap(files, async filepath => {
      const value = await this.read(filepath);
      const key = await this.key(filepath);
      _.set(data, key, value);
    });
    firost.cache.write(this.cacheKey, data);
    return data;
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
        const content = await firost.require(filepath);
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
    firost.cache.clear(this.cacheKey);
  },
};
