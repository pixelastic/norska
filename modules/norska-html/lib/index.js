import EventEmitter from 'events';
import config from 'norska-config';
import data from 'norska-data';
import ensureUrlTrailingSlash from 'ensure-url-trailing-slash';
import firost from 'firost';
import helper from 'norska-helper';
import path from 'path';
import pugMethods from './pugMethods';
import pug from 'pug';
import { _, pMap, chalk, timeSpan } from 'golgoth';

export default {
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
  /**
   * Compile a file from source into destination
   * @param {string} inputFile Absolute path to the source file. It is expected to
   * be in the config.from() folder
   * @returns {boolean} True on success, false otherwise
   **/
  async compile(inputFile) {
    // We double check that all data has been loaded
    await data.init();

    const sourceFolder = config.from();
    const absoluteSource = config.fromPath(inputFile);
    const relativeSource = path.relative(sourceFolder, absoluteSource);

    // We only compile files that are in the source directory
    if (!_.startsWith(absoluteSource, sourceFolder)) {
      firost.consoleWarn(
        `${absoluteSource} compilation aborted. It is not in the source directory.`
      );
      return false;
    }

    const relativeDestination = _.replace(relativeSource, /\.pug$/, '.html');
    const absoluteDestination = config.toPath(relativeDestination);

    const compileData = await this.getData(relativeDestination);

    let result;
    try {
      const compiler = pug.compileFile(absoluteSource, {
        filename: absoluteSource,
        basedir: config.from(),
      });
      result = compiler(compileData);
    } catch (err) {
      throw firost.error('ERROR_HTML_COMPILATION_FAILED', err.toString());
    }

    await firost.write(result, absoluteDestination);
    return true;
  },
  /**
   * Compile all source files to html
   **/
  async run() {
    // We warm the cache to avoid doing it for each compilation
    await data.init();

    const timer = timeSpan();
    const progress = firost.spinner();
    progress.tick('Compiling HTML');

    try {
      const pugFilesPattern = await this.pugFilesPattern();
      const pugFiles = await firost.glob(pugFilesPattern);
      await pMap(pugFiles, async filepath => {
        await this.compile(filepath);
      });
    } catch (error) {
      progress.failure('HTML compilation failed');
      throw error;
    }
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
    await firost.watch(pugFilesPattern, async filepath => {
      try {
        const timer = timeSpan();
        const relativePath = path.relative(config.from(), filepath);
        await this.compile(filepath);
        firost.consoleSuccess(
          `${relativePath} compiled in ${timer.rounded()}ms`
        );
      } catch (error) {
        firost.consoleError(chalk.red(error.message));
      }
    });

    // Reload all pug files whenever files in _data/ are changed
    const dataPath = config.fromPath('_data/**/*.{js,json}');
    await firost.watch(dataPath, async () => {
      await data.updateCache();
      await this.run();
    });

    // Rebuild everything whenever an included file changes
    const pugIncludePatterns = [config.fromPath('_includes/**/*')];
    await firost.watch(pugIncludePatterns, async () => {
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
};
