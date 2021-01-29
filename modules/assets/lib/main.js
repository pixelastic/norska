const config = require('norska-config');
const copy = require('firost/copy');
const glob = require('firost/glob');
const pMap = require('golgoth/pMap');
const path = require('path');
const remove = require('firost/remove');
const spinner = require('firost/spinner');
const timeSpan = require('golgoth/timeSpan');
const watch = require('firost/watch');
const _ = require('golgoth/lodash');
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
   * Copy a static file from source (or theme) to destination, keeping the same
   * directory structure
   * @param {string} inputFile Absolute path to the source file
   * */
  async compile(inputFile) {
    const sourcePath = config.from();
    const themePath = config.theme();
    const isFromTheme = _.startsWith(inputFile, themePath);

    const pathPrefix = isFromTheme ? themePath : sourcePath;
    const relativePath = path.relative(pathPrefix, inputFile);
    const outputFile = config.toPath(relativePath);

    await copy(inputFile, outputFile);
  },
  /**
   * Returns a list of all absolute globs to copy, both from the source and the
   * theme
   * @returns {Array} List of all absolute glob patterns
   **/
  globs() {
    const configAssetFiles = config.get('assets.files');
    const sourceGlobs = _.map(configAssetFiles, config.fromPath.bind(config));
    const themeGlobs = _.map(configAssetFiles, config.themePath.bind(config));
    return [...themeGlobs, ...sourceGlobs];
  },
  /**
   * Copy static assets from source and theme to destination, keeping same
   * directory structure but not performing any transformation
   **/
  async run() {
    const inputFiles = await glob(this.globs());
    const timer = timeSpan();
    const progress = this.__spinner(inputFiles.length);
    progress.text('Copying assets');

    await pMap(
      inputFiles,
      async (filepath) => {
        const relativePath = path.relative(config.from(), filepath);
        progress.tick(`Copying ${relativePath}`);
        await this.compile(filepath);
      },
      { concurrency: 500 }
    );
    progress.success(`Assets copied in ${timer.rounded()}ms`);
  },
  /**
   * Listen for any changes in assets and copy them to destination
   **/
  async watch() {
    await watch(this.globs(), async (filepath, type) => {
      // When removing a file in source, we remove it in destination as well
      if (type === 'removed') {
        const sourceFolder = config.from();
        const relativeSource = path.relative(sourceFolder, filepath);
        const absoluteDestination = config.toPath(relativeSource);
        await remove(absoluteDestination);
        return;
      }
      // Otherwise, we simply copy it
      await this.compile(filepath);
    });
  },
  __spinner: spinner,
};
