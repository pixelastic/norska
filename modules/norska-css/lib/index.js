import path from 'path';
import config from 'norska-config';
import firost from 'firost';
import { _, timeSpan, chalk } from 'golgoth';
import helper from 'norska-helper';
import postcss from 'postcss';
import postcssAutoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import postcssClean from 'postcss-clean';
import postcssPurge from '@fullhuman/postcss-purgecss';
import tailwind from 'tailwindcss';

export default {
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
  getPlugins() {
    const basePlugins = [
      this.__pluginImport(),
      this.__pluginNested(),
      this.__pluginTailwind(),
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
  getCompiler() {
    const plugins = this.getPlugins();

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
    const timer = timeSpan();
    const sourceFolder = config.from();
    const absoluteSource = config.fromPath(inputFile);
    const relativeSource = path.relative(sourceFolder, absoluteSource);
    const absoluteDestination = config.toPath(relativeSource);

    // We only compile files that are in the source directory
    if (!_.startsWith(absoluteSource, sourceFolder)) {
      helper.consoleWarn(
        `${absoluteSource} compilation aborted. It is not in the source directory.`
      );
      return false;
    }

    const rawContent = await firost.read(absoluteSource);
    const compiler = this.getCompiler();

    let compiledCss;
    try {
      const compilationResult = await compiler(rawContent, {
        from: absoluteSource,
      });
      compiledCss = _.get(compilationResult, 'css');
    } catch (err) {
      throw helper.error('ERROR_CSS_COMPILATION_FAILED', err.toString());
      // `[norska-js]: ${err.name} in ${relativeSource} on line ${err.line}`
    }

    await firost.write(compiledCss, absoluteDestination);
    helper.consoleSuccess(`${relativeSource} compiled in ${timer.rounded()}ms`);
    return true;
  },

  /**
   * Compile all source CSS to destination
   **/
  async run() {
    const inputFile = config.fromPath(config.get('css.input'));
    await this.compile(inputFile);
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

    // Rebuild the entrypoint whenever something changed
    await firost.watch(watchPatterns, async () => {
      try {
        await this.compile(inputFile);
      } catch (error) {
        helper.consoleError(chalk.red(error.message));
      }
    });
  },
  /**
   * Wrapper around the postcss method, to make it easier to mock in tests
   * @param {Array} plugins Array of plugins to load
   * @returns {object} A postcss instance
   **/
  __postcss(plugins) {
    return postcss(plugins);
  },
  /**
   * Wrapper around the postcss import plugin, to make it easier to mock in
   * tests
   * @returns {object} A postcss-import plugin instance
   **/
  __pluginImport() {
    return postcssImport();
  },
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
      whitelistPatterns: dynamicClassesPatterns,
      whitelistPatternsChildren: dynamicClassesPatterns,
    };
    return postcssPurge(options);
  },
  /**
   * Wrapper around Tailwindcss
   * @returns {object} A tailwind plugin instance
   **/
  __pluginTailwind() {
    const moduleConfig = path.resolve(__dirname, 'tailwind.config.js');
    return tailwind(moduleConfig);
  },
};
