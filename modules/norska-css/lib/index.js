import path from 'path';
import config from 'norska-config';
import firost from 'firost';
import { _ } from 'golgoth';
import helper from 'norska-helper';
import postcss from 'postcss';
import postcssAutoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import postcssClean from 'postcss-clean';
import postcssPurge from '@fullhuman/postcss-purgecss';
// import tailwind from 'tailwindcss';

export default {
  defaultConfig() {
    return {
      input: 'style.css',
    };
  },

  // postcssPlugins() {
  //   const tailwindConfigFile = config.get('css.tailwind.configPath');
  //   const plugins = [
  //     tailwind(tailwindConfigFile),
  //   ];

  //   plugins.push(
  //     postcssPurge({
  //       content: [`${config.to()}/**/*.html`],
  //       whitelistPatterns: [/^ais-/, /^js-/],
  //       whitelistPatternsChildren: [/^ais-/, /^js-/],
  //     })
  //   );


  //   plugins.push(postcssClean(cleanCssOptions));

  //   return plugins;
  // },

  // // Custom config added to the main config.css key
  // defaultConfig() {
  //   return {
  //     tailwind: {
  //       configPath: path.resolve(__dirname, '../build/tailwind.config.js'),
  //       // This method can be overwritten by the user to modify the config with
  //       // its own keys before being loaded
  //       configHook(tailwindConfig) {
  //         return tailwindConfig;
  //       },
  //     },
  //   };
  // },
  getPlugins() {
    const basePlugins = [this.__pluginImport(), this.__pluginNested()];

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
  getCompiler() {
    const plugins = this.getPlugins();

    const postcssInstance = this.__postcss(plugins);
    return _.bind(postcssInstance.process, postcssInstance);
  },

  // Compile the css source file to docs
  async compile(inputFile) {
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

    const rawContent = await firost.read(inputFile);
    const compiler = this.getCompiler();

    const compilationResult = await compiler(rawContent, {
      from: absoluteSource,
      // to: absoluteDestination,
    });
    const compiledCss = _.get(compilationResult, 'css');

    await firost.write(compiledCss, absoluteDestination);
    return true;
  },

  // Compile all css files
  async run() {
    const inputFile = config.fromPath(config.get('css.input'));
    await this.compile(inputFile);
  },

  // Listen to changes in css files and rebuild them
  // watch() {
  //   const from = config.from();
  //   // Rebuild main file when changed
  //   firost.watch(path.join(from, 'style.css'), filepath => {
  //     this.compile(filepath);
  //   });
  //   // Rebuild main file when includes are changed
  //   firost.watch(path.join(from, '_styles/*.css'), () => {
  //     this.compile('./src/style.css');
  //   });
  //   // Rebuild all files when main tailwind config is changed
  //   const tailwindConfigFile = config.get('css.tailwind.configPath');
  //   firost.watch(tailwindConfigFile, () => {
  //     this.run();
  //   });
  // },
  /**
   * Wrapper around the postcss method, to make it easier to mock in tests
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
    const options = {
      content: [`${config.to()}/**/*.html`],
    };
    return postcssPurge(options);
  },
};
