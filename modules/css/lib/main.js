const path = require('path');
const config = require('norska-config');
const _ = require('golgoth/lodash');
const chalk = require('golgoth/chalk');
const timeSpan = require('golgoth/timeSpan');
const helper = require('norska-helper');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const cssnano = require('cssnano');
const tailwind = require('tailwindcss');
const firostError = require('firost/error');
const consoleError = require('firost/consoleError');
const consoleSuccess = require('firost/consoleSuccess');
const read = require('firost/read');
const write = require('firost/write');
const spinner = require('firost/spinner');
const watch = require('firost/watch');
const exists = require('firost/exists');
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
   * Returns the list of postCSS plugins to load, based on the current env (prod or dev)
   * @returns {Array} Array of configured plugins
   */
  async getPlugins() {
    const basePlugins = [
      this.__pluginImport(),
      this.__pluginNested(),
      await this.__pluginTailwind(),
    ];

    // That's all the plugins we need in dev
    if (!helper.isProduction()) {
      return basePlugins;
    }

    const productionPlugins = [this.__pluginCssNano()];

    return [...basePlugins, ...productionPlugins];
  },
  /**
   * Returns a postCSS compiler instance, initialized with all the plugins
   * @returns {object} postCSS Compiler
   **/
  async getCompiler() {
    const postcssInstance = this.__postcss();

    // Init each plugin
    const plugins = await this.getPlugins();
    _.each(plugins, ({ plugin, options }) => {
      postcssInstance.use(plugin(options));
    });

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

    const cssSource = await read(absoluteSource);
    const result = await this.convert(cssSource);

    await this.__write(result, absoluteDestination);

    return true;
  },
  /**
   * Pass a CSS string through postcss
   * @param {string} cssSource CSS source string
   * @param {object} userOptions Options to pass to the conversion
   * - from: path to the source file, relative to source directory
   * @returns {string} CSS string
   **/
  async convert(cssSource, userOptions) {
    const options = {
      from: config.fromPath('style.css'),
      ...userOptions,
    };
    const compiler = await this.getCompiler();

    const themeSourcePath = config.themeFrom();
    const regexp = /@import ("|')theme:(?<filepath>.*)("|')/g;
    const withTheme = cssSource.replace(
      regexp,
      `@import "${themeSourcePath}/$2"`
    );

    try {
      const compilationResult = await compiler(withTheme, {
        from: options.from,
      });
      return _.get(compilationResult, 'css');
    } catch (err) {
      throw firostError('ERROR_CSS_COMPILATION_FAILED', err.toString());
    }
  },
  /**
   * Compile all source CSS to destination
   * @returns {boolean} False if CSS compilation is skipped
   **/
  async run() {
    const timer = timeSpan();
    const progress = this.__spinner();
    progress.tick('Compiling CSS');

    // Check that entry file exists, and fail early if it does not
    const entryFile = config.fromPath(config.get('css.input'));
    if (!(await exists(entryFile))) {
      progress.info('CSS compilation skipped');
      return false;
    }

    try {
      await this.compile(entryFile);
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
    const entrypoint = config.fromPath(config.get('css.input'));
    const watchPatterns = [
      entrypoint,
      `${config.from()}/_styles/**/*.css`, // Included files
      config.themeFromPath('**/*.css'), // Theme files
      config.rootPath('tailwind.config.js'), // Tailwind config
    ];

    // Rebuild the entrypoint whenever something changed
    await watch(watchPatterns, async () => {
      try {
        const timer = timeSpan();
        const relativePath = path.relative(config.from(), entrypoint);
        await this.compile(entrypoint);
        this.__consoleSuccess(
          `${relativePath} compiled in ${timer.rounded()}ms`
        );
      } catch (error) {
        this.__consoleError(chalk.red(error.message));
      }
    });
  },
  async getTailwindConfig() {
    // Use Tailwind config from host, but if not found, default to the builtin
    // one
    const configFromHost = config.rootPath('tailwind.config.js');
    const tailwindConfigPath = (await exists(configFromHost))
      ? configFromHost
      : './tailwind/index.js';
    const tailwindConfig = require(tailwindConfigPath);

    _.set(tailwindConfig, 'purge.enabled', helper.isProduction());
    return tailwindConfig;
  },
  /**
   * Wrapper around the postcss method, to make it easier to mock in tests
   * @param {Array} plugins Array of plugins to load
   * @returns {object} A postcss instance
   **/
  __postcss: postcss,
  /**
   * Postcss Import plugin and options
   * @returns {object} An object with a .plugin method, and its .options
   **/
  __pluginImport() {
    return {
      plugin: postcssImport,
      options: {},
    };
  },
  /**
   * Postcss Nested plugin and options
   * @returns {object} An object with a .plugin method, and its .options
   **/
  __pluginNested() {
    return {
      plugin: postcssNested,
      options: {},
    };
  },
  /**
   * CSSNano plugin and options
   * @returns {object} An object with a .plugin method, and its .options
   **/
  __pluginCssNano() {
    return {
      plugin: cssnano,
      options: {
        preset: [
          'advanced',
          // See https://www.npmjs.com/package/cssnano-preset-advanced
          // for details about each preset options
          {
            // Add and remove vendor prefixes
            autoprefixer: {
              add: true,
            },
            // Do not merge .a,.b{}, keep .a{} and .b{}
            mergeRules: false,
          },
        ],
      },
    };
  },
  /**
   * Tailwind plugin and options
   * @returns {object} A tailwind plugin instance
   **/
  async __pluginTailwind() {
    const options = await this.getTailwindConfig();
    return {
      plugin: tailwind,
      options,
    };
  },
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
  __write: write,
  __spinner: spinner,
};
