const config = require('norska-config');
const helper = require('norska-helper');
const copy = require('firost/copy');
const glob = require('firost/glob');
const pMap = require('golgoth/pMap');
const pProps = require('golgoth/pProps');
const path = require('path');
const read = require('firost/read');
const revHash = require('rev-hash');
const spinner = require('firost/spinner');
const timeSpan = require('golgoth/timeSpan');
const write = require('firost/write');
const defaultConfig = require('./config.js');
const pMapSeries = require('golgoth/pMapSeries');
const _ = require('golgoth/lodash');

module.exports = {
  /**
   * Replace revv placeholder with real path in all HTML files, and create
   * revved copy of all such files
   **/
  async run() {
    const timer = timeSpan();
    const progress = this.spinner();
    progress.tick('Revving assets');
    if (!helper.isProduction()) {
      progress.info('Revving skipped in dev');
      return;
    }

    try {
      const files = await glob(config.toPath('**/*.html'));
      await pMap(files, async (filepath) => {
        await this.compile(filepath);
      });

      await this.renameAssets();
    } catch (error) {
      progress.failure('Revving failed');
      throw error;
    }

    progress.success(`Assets revved in ${timer.rounded()}ms`);
  },
  /**
   * Replace all {revv: path} placeholders in a given HTML page
   * @param {string} sourceFile Path to the source html file
   **/
  async compile(sourceFile) {
    const fullPath = config.toPath(sourceFile);
    const htmlSource = await read(fullPath);
    const newSource = await this.convert(htmlSource, sourceFile);
    await write(newSource, fullPath);
  },
  /**
   * Convert an HTML source to replace all {revv: path} placeholders into real
   * paths
   * @param {string} htmlSource Source of the file to transform
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @returns {string} Converted HTML Source
   **/
  async convert(htmlSource, sourceFile) {
    let newSource = htmlSource;
    newSource = await this.convertWithOptions(newSource, sourceFile, {
      pattern: /{revv: (?<path>.*?)}/g,
      decode: _.identity,
      encode: _.identity,
    });
    // Revv placeholders can also be included in proxy image urls and need to be
    // converted there as well
    newSource = await this.convertWithOptions(newSource, sourceFile, {
      pattern: /%7Brevv%3A%20(?<path>.*?)%7D/g,
      decode: decodeURIComponent,
      encode: encodeURIComponent,
    });
    return newSource;
  },
  /**
   * Internal method used by convert to allow converting both url-encoded and
   * non url-encoded placeholders
   * @param {string} htmlSource Source of the file to transform
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @param {object} options Option object
   * @param {RegExp} options.pattern Regexp to match the placeholder
   * @param {Function} options.decode Method to execute on the match when found
   * @param {Function} options.encode Method to execute on the revved path
   * before replacing
   * @returns {string} Converted HTML Source
   **/
  async convertWithOptions(htmlSource, sourceFile, options) {
    const dirname = path.dirname(config.toPath(sourceFile));

    const matches = Array.from(htmlSource.matchAll(options.pattern));

    let newSource = htmlSource;
    await pMapSeries(matches, async ([fullMatch, rawMatchPath]) => {
      const matchPath = options.decode(rawMatchPath);
      const isFromRoot = matchPath.startsWith('/');

      const hashedPath = await this.getFileHash(matchPath);

      // Revvs starting with / should be transformed in path relative to the
      // root while others are relative to the current file
      const finalPath = isFromRoot
        ? hashedPath
        : path.relative(dirname, config.toPath(hashedPath));

      newSource = newSource.replace(fullMatch, options.encode(finalPath));
    });

    return newSource;
  },
  /**
   * Make a copy of each asset with its revved name
   **/
  async renameAssets() {
    await pProps(this.__hashes, async (revvedPath, initialPath) => {
      await copy(config.toPath(initialPath), config.toPath(revvedPath));
    });
  },
  /**
   * Returns the revved path of an asset
   * Will use the default hashing method unless revv.hashingMethod is defined,
   * and will keep results in cache for the whole run
   * @param {string} userFilepath Path to the asset
   * @returns {string} Revved path to the asset
   **/
  async getFileHash(userFilepath) {
    const filepath = _.trimStart(userFilepath, '/');

    // Fill up the cache on first call
    if (!this.__hashes[filepath]) {
      const hashingMethod =
        config.get('revv.hashingMethod') || this.hashFile.bind(this);
      this.__hashes[filepath] = await hashingMethod(filepath);
    }

    return this.__hashes[filepath];
  },
  /**
   * Default hashing method to add a unique revv identifier to a filepath
   * @param {string} filepath Path to the asset
   * @returns {string} Revved path to the asset
   **/
  async hashFile(filepath) {
    const hash = this.revHash(await this.read(config.toPath(filepath)));
    const extname = path.extname(filepath);
    const regexp = new RegExp(`${extname}$`);
    return filepath.replace(regexp, `.${hash}${extname}`);
  },
  /**
   * Default configuration object
   * @returns {object} Default module config
   **/
  defaultConfig() {
    return defaultConfig;
  },
  read,
  revHash,
  spinner,
  __hashes: {},
};
