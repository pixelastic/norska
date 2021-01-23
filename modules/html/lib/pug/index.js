const config = require('norska-config');
const pug = require('pug');
const _ = require('golgoth/lodash');
const write = require('firost/write');
const read = require('firost/read');
const firostError = require('firost/error');
const data = require('../data.js');
const pugMethods = require('./methods/index.js');
const frontMatter = require('front-matter');
const mixins = require('./mixins/index.js');

module.exports = {
  /**
   * Read all mixins from disk and keep them in cache so we can pass them to the
   * compiler
   **/
  async init() {
    await mixins.init();
  },
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
      const errorMessage = this.humanCompilationErrorMessage(err);
      throw firostError('ERROR_PUG_COMPILATION_FAILED', errorMessage);
    }

    await write(result, absoluteDestinationPath);
    config.set(['runtime', 'htmlFiles', sourcePath], destinationPath);
    return true;
  },
  /**
   * Returns a human readable error message from a pug compilation error
   * It will try to match the error to common issues and add helpful information
   * @param {object} rawError Error as thrown by pug
   * @returns {string} Readable error message
   **/
  humanCompilationErrorMessage(rawError) {
    const errorMessage = rawError.toString();
    const knownErrors = [
      {
        pugError: 'Only named blocks and mixins can appear at the top level',
        humanError: "Your pug content must be defined in a 'block content'",
      },
      {
        pugError: "Cannot read property 'call' of undefined",
        humanError: 'You seem to be calling a mixin that is not defined',
      },
    ];

    const humanError = _.chain(knownErrors)
      .find((error) => {
        return errorMessage.includes(error.pugError);
      })
      .get('humanError')
      .value();

    return humanError ? `${errorMessage}\n\n${humanError}` : errorMessage;
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

    const { attributes, body } = this.frontMatter(pugSource);

    const wrappedSource = await this.preflight(body, attributes.layout);
    const compiler = pug.compile(wrappedSource, {
      filename: config.fromPath(options.from),
      basedir: '/',
    });

    // Create a recursive compileData object that contains the pugMethods with
    // the right context
    const siteData = await data.all({
      sourceFile: options.from,
      destinationFile: options.to,
    });
    const baseData = _.merge(
      {},
      siteData,
      { data: { meta: attributes } },
      options.data
    );
    const compileData = {
      ...baseData,
      ...pugMethods(baseData, options.to),
    };

    return compiler(compileData);
  },
  /**
   * Wrap the pug source with all the necesary layout and mixins
   * @param {string} pugSource Raw pug source
   * @param {string} layoutName Layout to use
   * @returns {string} Updated pug source
   **/
  async preflight(pugSource, layoutName = 'default') {
    const withMixins = await this.addMixins(pugSource);
    const withLayout = await this.addLayout(withMixins, layoutName);
    return withLayout;
  },
  /**
   * Add all the default mixins to the pug source
   * @param {string} pugSource Pug string
   * @returns {string} Pug string with mixins added on top
   **/
  async addMixins(pugSource) {
    const mixinSource = mixins.getSource();

    // Add mixins at top
    return `${mixinSource}\n\n${pugSource}`;
  },
  /**
   * Add the correct layout to the top of the pug source
   * @param {string} pugSource Pug string
   * @param {string} layoutName Name of the layout to load
   * @returns {string} Pug string with extend line added on top
   **/
  async addLayout(pugSource, layoutName = 'default') {
    const layoutPath = await config.findFile(
      `_includes/layouts/${layoutName}.pug`
    );
    if (!layoutPath) {
      throw firostError(
        'ERROR_PUG_MISSING_LAYOUT',
        `Missing layout: ${layoutName}`
      );
    }
    return `extends ${layoutPath}\n\n${pugSource}`;
  },
  /**
   * Extract (custom) frontmatter from pug source
   * Pug does not allow for frontmatter by default, so we expect it to be
   * commented out with //-
   * @param {string} pugSource Pug source
   * @returns {object} Parsed frontmatter with .attributes and .body keys
   **/
  frontMatter(pugSource) {
    // We replace the custom commented frontmatter with its non-commented
    // version and pass it to frontMatter
    const regexp = new RegExp(
      '(?<pugFrontmatter>//- ---\\n.*?\\n//- ---\\n).*',
      's'
    );
    const match = pugSource.match(regexp);
    if (!match) {
      return {
        attributes: {},
        body: pugSource,
      };
    }

    const { pugFrontmatter } = match.groups;
    const cleanFrontmatter = pugFrontmatter.replace(/^\/\/- /gm, '');

    const cleanSource = pugSource.replace(pugFrontmatter, cleanFrontmatter);
    const { attributes, body } = frontMatter(cleanSource);
    return { attributes, body };
  },
  __mixins: null,
};
