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
const imageSize = require('image-size');
const sharp = require('sharp');

const PLACEHOLDER_MAX_DIMENSION = 8;

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
    const fromPath = config.from();
    const themeFromPath = config.themeFrom();
    const isFromTheme = _.startsWith(inputFile, themeFromPath);

    const pathPrefix = isFromTheme ? themeFromPath : fromPath;
    const relativePath = path.relative(pathPrefix, inputFile);
    const outputFile = config.toPath(relativePath);

    await copy(inputFile, outputFile);

    if (this.isImage(outputFile)) {
      await this.registerImage(outputFile);
    }
  },
  /**
   * Returns a list of all absolute globs to copy, both from the source and the
   * theme
   * @returns {Array} List of all absolute glob patterns
   **/
  globs() {
    const configAssetFiles = config.get('assets.files');
    const sourceGlobs = _.map(configAssetFiles, (globPattern) => {
      return this.absoluteGlob(globPattern, 'fromPath');
    });
    const themeGlobs = _.map(configAssetFiles, (globPattern) => {
      return this.absoluteGlob(globPattern, 'themeFromPath');
    });
    return [...themeGlobs, ...sourceGlobs];
  },
  /**
   * Convert a relative glob pattern to an absolute one by passing it through
   * one of the config method. Handles negated patterns
   * @param {string} globPattern Relative glob pattern
   * @param {string} configMethodName Name of a method to call on config, that
   * converts the path
   * @returns {string} Absolute glob pattern
   */
  absoluteGlob(globPattern, configMethodName) {
    const startsWithNegation = _.startsWith(globPattern, '!');
    const normalizedGlobPattern = _.trim(globPattern, '!');

    const method = config[configMethodName].bind(config);
    const absoluteGlobPattern = method(normalizedGlobPattern);
    return startsWithNegation ? `!${absoluteGlobPattern}` : absoluteGlobPattern;
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
  /**
   * Check if given filepath is an image, because it needs special treatment
   * @param {string} filepath Absolute path to the file
   * @returns {boolean} True if an image
   **/
  isImage(filepath) {
    const extname = path.extname(filepath);
    const allowlist = config.get('assets.imageExtensions');
    return _.includes(allowlist, extname);
  },
  /**
   * Store in runtime.imageManifest information about the given image for later
   * use in the +img mixin
   * @param {string} filepath Path to the image
   **/
  async registerImage(filepath) {
    const { width, height } = imageSize(filepath);
    const placeholder = await this.getLowQualityImagePlaceholder(filepath);
    const key = path.relative(config.to(), filepath);
    this.writeImageManifest(key, {
      width,
      height,
      base64: placeholder,
    });
  },
  /**
   * Returns a base64 encoded string of a LQIP (Low Quality Image Placeholder)
   * of the image
   * @param {string} filepath Path to the image
   * @returns {string} Base64 string of the placeholder
   **/
  async getLowQualityImagePlaceholder(filepath) {
    const buffer = await sharp(filepath)
      .resize(PLACEHOLDER_MAX_DIMENSION, PLACEHOLDER_MAX_DIMENSION, {
        fit: 'inside',
      })
      .toBuffer();
    return `data:image/png;base64,${buffer.toString('base64')}`;
  },
  /**
   * Write metadata information about a specific image in runtime config
   * @param {string} key Path to the file, relative to dist
   * @param {object} value Metadata object
   **/
  writeImageManifest(key, value) {
    config.set(`runtime.imageManifest["${key}"]`, value);
  },
  /**
   * Read metadata information about a specific image in runtime config
   * @param {string} key Path to the file, relative to dist
   * @returns {object} Metadata object
   **/
  readImageManifest(key) {
    return config.get(`runtime.imageManifest["${key}"]`, {});
  },
  __spinner: spinner,
};
