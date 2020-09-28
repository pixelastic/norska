const config = require('norska-config');
const ensureUrlTrailingSlash = require('ensure-url-trailing-slash');
const helper = require('norska-helper');
const norskaData = require('norska-data');
const path = require('path');
const _ = require('golgoth/lib/lodash');

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
   * @param {string} destination Path to the file created
   * @returns {object} Url Data
   **/
  async url(destination = 'index.html') {
    const sourceData = await this.data();

    const baseUrl = helper.isProduction()
      ? _.get(sourceData, 'site.url', '/')
      : `http://127.0.0.1:${config.get('port')}`;

    const fullPathDir = path.dirname(config.toPath(destination));
    const relativePathDir = path.relative(fullPathDir, config.to());
    const pathToRoot = _.isEmpty(relativePathDir)
      ? './'
      : `${relativePathDir}/`;

    const here = destination.replace(/index\.html$/, '');

    return {
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
   * @param {string} destination Path to the destination file created
   * @returns {object} Data object
   **/
  async all(destination) {
    await norskaData.warmCache();

    const data = await this.data();
    const url = await this.url(destination);
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
