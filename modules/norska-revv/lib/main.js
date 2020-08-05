const config = require('norska-config');
const copy = require('firost/lib/copy');
const exist = require('firost/lib/exist');
const glob = require('firost/lib/glob');
const helper = require('norska-helper');
const pMap = require('golgoth/lib/pMap');
const path = require('path');
const read = require('firost/lib/read');
const revHash = require('rev-hash');
const spinner = require('firost/lib/spinner');
const timeSpan = require('golgoth/lib/timeSpan');
const write = require('firost/lib/write');
const _ = require('golgoth/lib/lodash');
const defaultConfig = require('./config.js');

module.exports = {
  /**
   * Default configuration object
   * @returns {object} Default module config
   **/
  defaultConfig() {
    return defaultConfig;
  },
  /**
   * Convenience method to read/write in the cached manifest
   * Each key is the base asset path, and value is its revved path or null
   * @param {object} value Manifest object to write
   * @returns {object} Manifest object read from cache
   **/
  manifest(value) {
    if (!value) {
      return config.get('runtime.revvFiles', {});
    }
    config.set('runtime.revvFiles', value);
  },
  /**
   * Add a file to the manifest
   * Note: This method is called from template files with revv()
   * @param {string} filepath Path to the file to revv
   **/
  add(filepath) {
    const manifest = this.manifest();
    manifest[filepath] = null;
    this.manifest(manifest);
  },
  /**
   * Returns a hash from a filepath
   * @param {string} filepath Path to the file
   * @returns {string} Hash
   **/
  async getHash(filepath) {
    const hashingMethod = config.get('revv.hashingMethod');
    if (!hashingMethod) {
      const fullPath = config.toPath(filepath);
      const hash = revHash(await read(fullPath));
      const extname = path.extname(filepath);
      return _.replace(
        filepath,
        new RegExp(`${extname}$`),
        `.${hash}${extname}`
      );
    }
    return await hashingMethod(filepath);
  },
  /**
   * Return the revved filepath of any file
   * @param {string} filepath Path to the initial file
   * @returns {string} Revved filepath
   **/
  async revvPath(filepath) {
    const fullPath = config.toPath(filepath);

    if (!(await exist(fullPath))) {
      return filepath;
    }

    return await this.getHash(filepath);
  },
  /**
   * Update the manifest with revved filenames for each file
   **/
  async fillManifest() {
    const manifest = this.manifest();
    await pMap(_.keys(manifest), async (asset) => {
      manifest[asset] = await this.revvPath(asset);
    });
    this.manifest(manifest);
  },
  /**
   * Replace all {revv: path} to real revved path in the specified file
   * @param {string} htmlPath Path to the HTML file to update
   **/
  async compile(htmlPath) {
    let content = await read(htmlPath);

    const manifest = this.manifest();
    _.each(manifest, (revvedPath, basePath) => {
      const absoluteRevvedPath = config.toPath(revvedPath);
      const destinationFolder = path.dirname(htmlPath);
      let relativeRevvedPath = path.relative(
        destinationFolder,
        absoluteRevvedPath
      );

      // We need to decode revv and absoluteRevv placeholders
      const revvPattern = `{revv: ${basePath}}`;
      const absoluteRevvPattern = `{absoluteRevv: ${basePath}}`;
      const replacements = [
        { from: revvPattern, to: relativeRevvedPath },
        { from: absoluteRevvPattern, to: revvedPath },
      ];

      content = _.reduce(
        replacements,
        function (result, item) {
          return (
            _.chain(result)
              .replace(new RegExp(item.from, 'g'), item.to)
              // We also need to replace urlencoded placeholders with urlencoded
              // values (for example when they are in an image proxy links)
              .replace(
                new RegExp(encodeURIComponent(item.from), 'g'),
                encodeURIComponent(item.to)
              )
              .value()
          );
        },
        content
      );
    });

    await write(content, htmlPath);
  },
  /**
   * Create a revved copy of each revved asset
   * Note: We keep the original asset as well, in case it is referenced without
   * revving
   **/
  async renameAssets() {
    const assets = _.map(this.manifest(), (revvedPath, basePath) => {
      return { revvedPath, basePath };
    });
    await pMap(assets, async (asset) => {
      const basePath = config.toPath(asset.basePath);
      const revvedPath = config.toPath(asset.revvedPath);
      await copy(basePath, revvedPath);
    });
  },
  /**
   * Update all HTML files in destination with path to the revved assets
   **/
  async run() {
    const timer = timeSpan();
    const progress = this.__spinner();
    progress.tick('Revving assets');
    if (!helper.isProduction()) {
      progress.info('Revving skipped in dev');
      return;
    }

    try {
      await this.fillManifest();
      const htmlFiles = await glob(config.toPath('**/*.html'));

      await pMap(htmlFiles, async (filepath) => {
        await this.compile(filepath);
      });

      await this.renameAssets();
    } catch (error) {
      progress.failure('Revving failed');
      throw error;
    }

    progress.success(`Assets revved in ${timer.rounded()}ms`);
  },
  __spinner: spinner,
};
