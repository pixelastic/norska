const config = require('norska-config');
const pug = require('pug');
const _ = require('golgoth/lib/lodash');
const write = require('firost/lib/write');
const read = require('firost/lib/read');
const firostError = require('firost/lib/error');
const data = require('../data.js');
const path = require('path');
const glob = require('firost/lib/glob');
const pMap = require('golgoth/lib/pMap');
const pugMethods = require('./methods/index.js');

module.exports = {
  /**
   * Compile a pug page into html
   * @param {string} sourcePath Path to the source pug file
   * @param {string} destinationPath Path to the destination html file
   * @param {object} pageData Data to pass to the page
   * @returns {boolean} True on success
   **/
  async compile(sourcePath, destinationPath, pageData = {}) {
    const absoluteSourcePath = config.fromPath(sourcePath);
    const absoluteDestinationPath = config.toPath(destinationPath);

    let result;
    try {
      const pugSource = await read(absoluteSourcePath);
      const options = {
        from: sourcePath,
        to: destinationPath,
        data: { data: pageData },
      };
      result = await this.convert(pugSource, options);
    } catch (err) {
      throw firostError('ERROR_PUG_COMPILATION_FAILED', err.toString());
    }

    await write(result, absoluteDestinationPath);
    return true;
  },
  /**
   * Convert a pug string into HTML
   * @param {string} pugSource Pug source string
   * @param {object} userOptions Options to pass to the conversion
   * - from: path to the source file, relative to source directory
   * - to: path to destination file, relative to destination directory
   * - data: Data to pass to the page
   * @returns {string} HTML string
   **/
  async convert(pugSource, userOptions) {
    const options = {
      from: 'index.pug',
      to: 'index.html',
      data: {},
      ...userOptions,
    };

    const wrappedSource = await this.addMixins(pugSource);
    const compiler = pug.compile(wrappedSource, {
      filename: config.fromPath(options.from),
      basedir: config.from(),
    });

    // Create a recursive compileData object that contains the pugMethods with
    // the right context
    const siteData = await data.all(options.to);
    const baseData = _.merge({}, siteData, options.data);
    const compileData = {
      ...baseData,
      ...pugMethods(baseData, options.to),
    };

    return compiler(compileData);
  },
  /**
   * Add all the default mixins to the pug source
   * @param {string} pugSource Pug string
   * @returns {string} Pug string with mixins added on top
   **/
  async addMixins(pugSource) {
    // Read and concatenate all files in ./pugMixins
    if (!this.__mixins) {
      const mixinDir = path.resolve(__dirname, 'mixins');
      const mixinFiles = await glob(`${mixinDir}/*.pug`);
      const mixinContent = await pMap(mixinFiles, read);
      this.__mixins = mixinContent.join('\n\n');
    }

    // If starts with extends, add the mixins on the second line
    if (_.startsWith(pugSource, 'extends ')) {
      const lines = pugSource.split('\n');
      lines.splice(1, 0, this.__mixins);
      return lines.join('\n');
    }
    // Add mixins at the very top
    return `${this.__mixins}\n\n${pugSource}`;
  },
  __mixins: null,
};
