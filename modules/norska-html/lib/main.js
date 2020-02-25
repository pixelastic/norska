const EventEmitter = require('events');
const config = require('norska-config');
const data = require('norska-data');
const ensureUrlTrailingSlash = require('ensure-url-trailing-slash');
const helper = require('norska-helper');
const path = require('path');
const pugMethods = require('./pugMethods');
const pug = require('pug');
const _ = require('golgoth/lib/lodash');
const chalk = require('golgoth/lib/chalk');
const pMap = require('golgoth/lib/pMap');
const timeSpan = require('golgoth/lib/timeSpan');
const write = require('firost/lib/write');
const spinner = require('firost/lib/spinner');
const glob = require('firost/lib/glob');
const watch = require('firost/lib/watch');
const consoleSuccess = require('firost/lib/consoleSuccess');
const consoleWarn = require('firost/lib/consoleWarn');
const consoleError = require('firost/lib/consoleError');
const firostError = require('firost/lib/error');

module.exports = {
  /**
   * Returns the list of pug files to be processed by the plugin
   * @returns {Array} List of absolute path to pug files to process
   **/
  async pugFilesPattern() {
    const source = config.from();
    return [`${source}/**/*.pug`, `!${source}/_*/**/*.pug`];
  },
  /**
   * Return the data to be passed to each compiled file
   * @param {string} destination Path to the destination file created
   * @returns {object} Data object
   **/
  async getData(destination) {
    // We double check that all data has been loaded
    await data.init();

    const sourceData = await data.getAll();

    const siteUrl = _.get(sourceData, 'site.url', '/');
    const liveServerUrl = `http://127.0.0.1:${config.get('port')}`;
    const baseUrl = helper.isProduction() ? siteUrl : liveServerUrl;

    // Various ways of refering to the current document in the url
    const fullPathDir = path.dirname(config.toPath(destination));
    const relativePathDir = path.relative(fullPathDir, config.to());
    const pathToRoot = _.isEmpty(relativePathDir)
      ? './'
      : `${relativePathDir}/`;
    const urlData = {
      base: baseUrl,
      here: `/${destination}`,
      pathToRoot,
    };

    // Runtime data, like compiled script names to include
    const runtimeData = config.get('runtime', {});

    // Tweaks that are helpful to have in every norska build
    const tweaksData = {
      // JavaScript snippet to force a redirect if no trailing slash
      ensureUrlTrailingSlashSource: ensureUrlTrailingSlash.source,
    };

    const baseData = {
      data: sourceData,
      url: urlData,
      runtime: runtimeData,
      tweaks: tweaksData,
    };

    return {
      ...baseData,
      ...pugMethods(baseData, destination),
    };
  },
  async createPage(source, destination, pageData = {}) {
    const absoluteDestination = config.toPath(destination);
    const absoluteSource = config.fromPath(source);
    const siteData = await this.getData(destination);
    const compileData = _.merge({}, siteData, { data: pageData });

    let result;
    try {
      const compiler = pug.compileFile(absoluteSource, {
        filename: absoluteSource,
        basedir: config.from(),
      });
      result = compiler(compileData);
    } catch (err) {
      throw firostError('ERROR_HTML_COMPILATION_FAILED', err.toString());
    }

    await write(result, absoluteDestination);
    return true;
  },
  /**
   * Compile a file from source into destination
   * @param {string} inputFile Absolute path to the source file. It is expected to
   * be in the config.from() folder
   * @returns {boolean} True on success, false otherwise
   **/
  async compile(inputFile) {
    const sourceFolder = config.from();
    const absoluteSource = config.fromPath(inputFile);

    // We only compile files that are in the source directory
    if (!_.startsWith(absoluteSource, sourceFolder)) {
      this.__consoleWarn(
        `${absoluteSource} compilation aborted. It is not in the source directory.`
      );
      return false;
    }

    const relativeSource = path.relative(sourceFolder, absoluteSource);
    const relativeDestination = _.replace(relativeSource, /\.pug$/, '.html');
    return await this.createPage(relativeSource, relativeDestination);
  },
  /**
   * Compile all source files to html
   **/
  async run() {
    // We warm the cache to avoid doing it for each compilation
    await data.init();

    const timer = timeSpan();
    const progress = this.__spinner();
    progress.tick('Compiling HTML');

    try {
      const pugFilesPattern = await this.pugFilesPattern();
      const pugFiles = await glob(pugFilesPattern);
      await pMap(pugFiles, async filepath => {
        await this.compile(filepath);
      });
    } catch (error) {
      progress.failure('HTML compilation failed');
      throw error;
    }

    // Running hook
    await config.get('hooks.afterHtml')({
      createPage: this.createPage.bind(this),
    });

    progress.success(`HTML compiled in ${timer.rounded()}ms`);
    this.pulse.emit('run');
  },
  /**
   * Listen to any changes on pug files and rebuild them
   **/
  async watch() {
    // We warm the cache to avoid doing it for each compilation
    await data.init();

    // Reload a given pug file whenever it is changed
    const pugFilesPattern = await this.pugFilesPattern();
    await watch(pugFilesPattern, async filepath => {
      try {
        const timer = timeSpan();
        const relativePath = path.relative(config.from(), filepath);
        await this.compile(filepath);
        this.__consoleSuccess(
          `${relativePath} compiled in ${timer.rounded()}ms`
        );
      } catch (error) {
        this.__consoleError(chalk.red(error.message));
      }
    });

    // Reload all pug files whenever files in _data/ are changed
    const dataPath = config.fromPath('_data/**/*.{js,json}');
    await watch(dataPath, async () => {
      await data.updateCache();
      await this.run();
    });

    // Rebuild everything whenever an included file changes
    const pugIncludePatterns = [config.fromPath('_includes/**/*')];
    await watch(pugIncludePatterns, async () => {
      await this.run();
    });

    // Rebuild everything whenever the list of jsFiles to include changes
    config.pulse.on('set', async key => {
      if (key !== 'runtime.jsFiles') {
        return;
      }
      await this.run();
    });
  },
  /**
   * Event emitter to emit/listen to events
   **/
  pulse: new EventEmitter(),
  __consoleError: consoleError,
  __consoleSuccess: consoleSuccess,
  __consoleWarn: consoleWarn,
  __spinner: spinner,
};
