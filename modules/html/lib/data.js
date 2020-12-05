const config = require('norska-config');
const ensureUrlTrailingSlash = require('ensure-url-trailing-slash');
const helper = require('norska-helper');
const norskaData = require('norska-data');
const path = require('path');
const _ = require('golgoth/lodash');

module.exports = {
  /**
   * Data defined in the _data folder
   * @returns {object} Site-wide data
   **/
  async data() {
    return await norskaData.getAll();
  },
  /**
   * Data relative to the current URL, to help crafting links
   * @param {object} options Paths to the source and destination files
   * @param {string} options.sourceFile Path to the source file
   * @param {string} options.destinationFile Path to the destination file
   * @returns {object} Url Data
   **/
  async url(options = {}) {
    const { sourceFile, destinationFile = 'index.html' } = options;
    const sourceData = await this.data();

    const baseUrl = helper.isProduction()
      ? _.get(sourceData, 'site.url', '/')
      : `http://127.0.0.1:${config.get('port')}`;

    const fullPathDir = path.dirname(config.toPath(destinationFile));
    const relativePathDir = path.relative(fullPathDir, config.to());
    const pathToRoot = _.isEmpty(relativePathDir)
      ? './'
      : `${relativePathDir}/`;

    const here = destinationFile.replace(/index\.html$/, '');

    return {
      sourceFile,
      base: baseUrl,
      here: `/${here}`,
      pathToRoot,
    };
  },
  /**
   * Runtime data, could be different on each build like list of scripts to
   * include or last commit hash
   * @returns {object} Runtime data
   **/
  async runtime() {
    return config.get('runtime', {});
  },
  /**
   * Tweaks added to each page. Hopefully we could reduce this list to nothing
   * at some point
   * @returns {object} Tweaks data
   **/
  tweaks() {
    return {
      // JavaScript snippet to force a redirect if no trailing slash on Netlify
      ensureUrlTrailingSlashSource: ensureUrlTrailingSlash.source,
    };
  },
  /**
   * Return the data to be passed to each compiled file
   * @param {object} options Path to the source and destination files
   * @returns {object} Data object
   **/
  async all(options) {
    await norskaData.warmCache();

    const data = await this.data();
    const url = await this.url(options);
    const runtime = await this.runtime();
    const tweaks = this.tweaks();

    return {
      data,
      url,
      runtime,
      tweaks,
    };
  },
};
