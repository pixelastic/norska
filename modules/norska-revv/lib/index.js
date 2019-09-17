import config from 'norska-config';
import firost from 'firost';
import helper from 'norska-helper';
import path from 'path';
import revHash from 'rev-hash';
import { _, pMap } from 'golgoth';

export default {
  // Cache to save list of input files and revved file names
  cacheKey: 'norska.revv',
  /**
   * Convenience method to read/write in the cached manifest
   * Each key is the base asset path, and value is its revved path or null
   * @param {object} value Manifest object to write
   * @returns {object} Manifest object read from cache
   **/
  manifest(value) {
    if (!value) {
      return firost.cache.read(this.cacheKey, {});
    }
    firost.cache.write(this.cacheKey, value);
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
   * Return the revved filepath of any file
   * @param {string} filepath Path to the initial file
   * @returns {string} Revved filepath
   **/
  async revvPath(filepath) {
    const fullPath = config.toPath(_.trimStart(filepath, '/'));

    if (!(await firost.exist(fullPath))) {
      return filepath;
    }

    const hash = revHash(await firost.read(fullPath));
    const extname = path.extname(filepath);
    return _.replace(filepath, new RegExp(`${extname}$`), `.${hash}${extname}`);
  },
  /**
   * Update the manifest with revved filenames for each file
   **/
  async fillManifest() {
    const manifest = this.manifest();
    await pMap(_.keys(manifest), async asset => {
      manifest[asset] = await this.revvPath(asset);
    });
    this.manifest(manifest);
  },
  /**
   * Replace all {revv: path} to real revved path in the specified file
   * @param {string} htmlPath Path to the HTML file to update
   **/
  async compile(htmlPath) {
    let content = await firost.read(htmlPath);

    const manifest = this.manifest();
    _.each(manifest, (revvedPath, basePath) => {
      content = _.replace(
        content,
        new RegExp(`{revv: ${basePath}}`, 'g'),
        revvedPath
      );
    });

    await firost.write(content, htmlPath);
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
    await pMap(assets, async asset => {
      const basePath = config.toPath(_.trimStart(asset.basePath, '/'));
      const revvedPath = config.toPath(_.trimStart(asset.revvedPath, '/'));
      await firost.copy(basePath, revvedPath);
    });
  },
  /**
   * Update all HTML files in destination with path to the revved assets
   **/
  async run() {
    if (!helper.isProduction()) {
      return;
    }
    await this.fillManifest();

    const htmlFiles = await firost.glob(config.toPath('**/*.html'));
    await pMap(htmlFiles, async filepath => {
      await this.compile(filepath);
    });

    await this.renameAssets();
  },
};
