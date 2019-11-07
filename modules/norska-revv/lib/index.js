import config from 'norska-config';
import firost from 'firost';
import helper from 'norska-helper';
import path from 'path';
import revHash from 'rev-hash';
import { _, pMap, timeSpan } from 'golgoth';

export default {
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
   * Return the revved filepath of any file
   * @param {string} filepath Path to the initial file
   * @returns {string} Revved filepath
   **/
  async revvPath(filepath) {
    const fullPath = config.toPath(filepath);

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
      const baseFullPath = config.toPath(basePath);
      const baseRelativePath = path.relative(
        path.dirname(htmlPath),
        baseFullPath
      );
      const revvedRelativePath = _.replace(
        baseRelativePath,
        new RegExp(`${basePath}$`),
        revvedPath
      );

      content = _.replace(
        content,
        new RegExp(`{revv: ${basePath}}`, 'g'),
        revvedRelativePath
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
      const basePath = config.toPath(asset.basePath);
      const revvedPath = config.toPath(asset.revvedPath);
      await firost.copy(basePath, revvedPath);
    });
  },
  /**
   * Update all HTML files in destination with path to the revved assets
   **/
  async run() {
    const timer = timeSpan();
    const progress = firost.spinner();
    progress.tick('Revving assets');
    if (!helper.isProduction()) {
      progress.success('Revving skipped in dev');
      return;
    }

    try {
      await this.fillManifest();
      const htmlFiles = await firost.glob(config.toPath('**/*.html'));

      await pMap(htmlFiles, async filepath => {
        await this.compile(filepath);
      });

      await this.renameAssets();
    } catch (error) {
      progress.failure('Revving failed');
      throw error;
    }

    progress.success(`Assets revved in ${timer.rounded()}ms`);
  },
};
