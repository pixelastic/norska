const path = require('path');
const config = require('norska-config');
const _ = require('golgoth/lib/lodash');
const chalk = require('golgoth/lib/chalk');
const timeSpan = require('golgoth/lib/timeSpan');
const helper = require('norska-helper');
const postcss = require('postcss');
const postcssAutoprefixer = require('autoprefixer');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssClean = require('postcss-clean');
const postcssPurge = require('@fullhuman/postcss-purgecss');
const purgeHtml = require('purge-from-html');
const tailwind = require('tailwindcss');
const firostError = require('firost/lib/error');
const consoleError = require('firost/lib/consoleError');
const consoleSuccess = require('firost/lib/consoleSuccess');
const read = require('firost/lib/read');
const write = require('firost/lib/write');
const spinner = require('firost/lib/spinner');
const watch = require('firost/lib/watch');
const exists = require('firost/lib/exists');

module.exports = {
  /**
   * Default configuration object
   * @returns {object} Default module config
   **/
  defaultConfig() {
    return {
      input: 'style.css',
    };
  },

  /**
   * Returns the list of postCSS plugins to load, based on the current env (prod or dev)
   * @returns {Array} Array of configured plugins
   */
  async getPlugins() {
    const tailwindConfigPath = await this.getTailwindConfigPath();
    const basePlugins = [
      this.__pluginImport(),
      this.__pluginNested(),
      this.__pluginTailwind(tailwindConfigPath),
    ];

    // That's all the plugins we need in dev
    if (!helper.isProduction()) {
      return basePlugins;
    }

    const productionPlugins = [
      this.__pluginPurge(),
      this.__pluginAutoprefixer(),
      this.__pluginClean(),
    ];

    return _.concat(basePlugins, productionPlugins);
  },
  /**
   * Returns a postCSS compiler instance, initialized with all the plugins
   * @returns {object} postCSS Compiler
   **/
  async getCompiler() {
    const plugins = await this.getPlugins();

    const postcssInstance = this.__postcss(plugins);
    return _.bind(postcssInstance.process, postcssInstance);
  },

  /**
   * Compile the specified input file to the destination folder
   * @param {string} inputFile Path to the input file, relative to the source
   * directory
   * @returns {boolean} True on success, false otherwise
   **/
  async compile(inputFile) {
    const sourceFolder = config.from();
    const absoluteSource = config.fromPath(inputFile);
    const relativeSource = path.relative(sourceFolder, absoluteSource);
    const absoluteDestination = config.toPath(relativeSource);

    // We only compile files that are in the source directory
    if (!_.startsWith(absoluteSource, sourceFolder)) {
      throw firostError(
        'ERROR_CSS_COMPILATION_FAILED',
        `${absoluteSource} is not in the source directory.`
      );
    }

    const rawContent = await read(absoluteSource);
    const compiler = await this.getCompiler();

    let compiledCss;
    try {
      const compilationResult = await compiler(rawContent, {
        from: absoluteSource,
      });
      compiledCss = _.get(compilationResult, 'css');
    } catch (err) {
      throw firostError('ERROR_CSS_COMPILATION_FAILED', err.toString());
    }

    await this.__write(compiledCss, absoluteDestination);

    return true;
  },

  /**
   * Compile all source CSS to destination
   **/
  async run() {
    const timer = timeSpan();
    const progress = this.__spinner();
    progress.tick('Compiling CSS');

    try {
      const inputFile = config.fromPath(config.get('css.input'));
      await this.compile(inputFile);
    } catch (error) {
      progress.failure('CSS compilation failed');
      throw error;
    }

    progress.success(`CSS compiled in ${timer.rounded()}ms`);
  },

  /**
   * Listen to any changes on css files and rebuild them
   **/
  async watch() {
    const watchPatterns = [];

    // Listen to the entrypoint
    const inputFile = config.fromPath(config.get('css.input'));
    watchPatterns.push(inputFile);

    // Listen to the includes files
    const includedFiles = `${config.from()}/_styles/**/*.css`;
    watchPatterns.push(includedFiles);

    // Listen to the tailwind.config.js file
    const tailwindConfig = await this.getTailwindConfigPath();
    watchPatterns.push(tailwindConfig);

    // Rebuild the entrypoint whenever something changed
    await watch(watchPatterns, async () => {
      try {
        const timer = timeSpan();
        const relativePath = path.relative(config.from(), inputFile);
        await this.compile(inputFile);
        this.__consoleSuccess(
          `${relativePath} compiled in ${timer.rounded()}ms`
        );
      } catch (error) {
        this.__consoleError(chalk.red(error.message));
      }
    });
  },
  async getTailwindConfigPath() {
    // First check in the host
    const configFromHost = config.rootPath('tailwind.config.js');
    if (await exists(configFromHost)) {
      return configFromHost;
    }

    // Fallback to value in norska-css
    return path.resolve(__dirname, './tailwind.config.js');
  },
  /**
   * Wrapper around the postcss method, to make it easier to mock in tests
   * @param {Array} plugins Array of plugins to load
   * @returns {object} A postcss instance
   **/
  __postcss: postcss,
  /**
   * Wrapper around the postcss import plugin, to make it easier to mock in
   * tests
   * @returns {object} A postcss-import plugin instance
   **/
  __pluginImport: postcssImport,
  /**
   * Wrapper around the postcss nested plugin, to make it easier to mock in
   * tests
   * @returns {object} A postcss-nested plugin object
   **/
  __pluginNested() {
    return postcssNested;
  },
  /**
   * Wrapper around the postcss autoprefixer plugin, to make it easier to mock in
   * tests
   * @returns {object} A postcss-autoprefixer plugin object
   **/
  __pluginAutoprefixer() {
    return postcssAutoprefixer;
  },
  /**
   * Wrapper around the postcss clean plugin, to make it easier to mock in
   * tests
   * @returns {object} A postcss-clean plugin instance
   **/
  __pluginClean() {
    const options = {
      level: {
        1: {
          specialComments: false,
        },
      },
    };
    return postcssClean(options);
  },
  /**
   * Wrapper around the postcss purge plugin, to make it easier to mock in
   * tests
   * @returns {object} A postcss-clean plugin instance
   **/
  __pluginPurge() {
    const dynamicClassesPatterns = [/^ais-/, /^js-/];
    const options = {
      content: [`${config.to()}/**/*.html`],
      extractors: [
        {
          extractor: purgeHtml,
          extensions: ['html'],
        },
      ],
      whitelistPatterns: dynamicClassesPatterns,
      whitelistPatternsChildren: dynamicClassesPatterns,
    };
    return postcssPurge(options);
  },
  /**
   * Wrapper around Tailwindcss
   * @returns {object} A tailwind plugin instance
   **/
  __pluginTailwind: tailwind,
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
  __write: write,
  __spinner: spinner,
};
