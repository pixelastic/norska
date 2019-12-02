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
import purgeHtml from 'purge-from-html';
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
  async getPlugins() {
    const tailwindConfigPath = await this.getTailwindConfigPath();
    console.info(tailwindConfigPath);
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
      throw firost.error(
        'ERROR_CSS_COMPILATION_FAILED',
        `${absoluteSource} is not in the source directory.`
      );
    }

    const rawContent = await firost.read(absoluteSource);
    const compiler = await this.getCompiler();

    let compiledCss;
    try {
      const compilationResult = await compiler(rawContent, {
        from: absoluteSource,
      });
      compiledCss = _.get(compilationResult, 'css');
    } catch (err) {
      throw firost.error('ERROR_CSS_COMPILATION_FAILED', err.toString());
    }

    await firost.write(compiledCss, absoluteDestination);

    return true;
  },

  /**
   * Compile all source CSS to destination
   **/
  async run() {
    const timer = timeSpan();
    const progress = firost.spinner();
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

    // Rebuild the entrypoint whenever something changed
    await firost.watch(watchPatterns, async () => {
      try {
        const timer = timeSpan();
        const relativePath = path.relative(config.from(), inputFile);
        await this.compile(inputFile);
        firost.consoleSuccess(
          `${relativePath} compiled in ${timer.rounded()}ms`
        );
      } catch (error) {
        firost.consoleError(chalk.red(error.message));
      }
    });
  },
  async getTailwindConfigPath() {
    // First check in the host
    const configFromHost = config.rootPath('tailwind.config.js');
    if (await firost.exists(configFromHost)) {
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
};
