import data from 'norska-data';
import config from 'norska-config';
import helper from 'norska-helper';
import path from 'path';
import { _, pMap, chalk } from 'golgoth';
import firost from 'firost';
import pug from 'pug';
import pugMethods from './pugMethods';

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
    const sourceData = await data.getSourceData();

    const siteUrl = _.get(sourceData, 'site.url', '/');
    const liveServerUrl = `http://127.0.0.1:${config.get('port')}`;
    const baseUrl = helper.isProduction() ? siteUrl : liveServerUrl;

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
    const runtimeData = config.get('runtime', {});

    const baseData = {
      data: sourceData,
      url: urlData,
      runtime: runtimeData,
    };

    return {
      ...baseData,
      ...pugMethods(baseData),
    };
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
    const relativeSource = path.relative(sourceFolder, absoluteSource);

    // We only compile files that are in the source directory
    if (!_.startsWith(absoluteSource, sourceFolder)) {
      helper.consoleWarn(
        `${absoluteSource} compilation aborted. It is not in the source directory.`
      );
      return false;
    }

    const relativeDestination = _.replace(relativeSource, /\.pug$/, '.html');
    const absoluteDestination = config.toPath(relativeDestination);

    const data = await this.getData(relativeDestination);

    let result;
    try {
      const compiler = pug.compileFile(absoluteSource, {
        filename: absoluteSource,
        basedir: config.from(),
      });
      result = compiler(data);
    } catch (err) {
      throw helper.error('ERROR_HTML_COMPILATION_FAILED', err.toString());
    }

    await firost.write(result, absoluteDestination);
    return true;
  },
  /**
   * Compile all source files to html
   **/
  async run() {
    const pugFilesPattern = await this.pugFilesPattern();
    const pugFiles = await firost.glob(pugFilesPattern);
    await pMap(pugFiles, async filepath => {
      await this.compile(filepath);
    });
  },
  /**
   * Listen to any changes on pug files and rebuild them
   **/
  async watch() {
    // Reload a given pug file whenever it is changed
    const pugFilesPattern = await this.pugFilesPattern();
    await firost.watch(pugFilesPattern, async filepath => {
      try {
        await this.compile(filepath);
      } catch (error) {
        helper.consoleError(chalk.red(error.message));
      }
    });

    // Reload all pug files whenever files in _data/ are changed
    const dataPath = config.fromPath('_data/**/*.{js,json}');
    await firost.watch(dataPath, async () => {
      // Clear the cache so we don't read a stale data
      data.clearCache();
      await this.run();
    });

    // Rebuild everything whenever an included file changes
    const pugIncludePatterns = [config.fromPath('_includes/**/*')];
    await firost.watch(pugIncludePatterns, async () => {
      await this.run();
    });
  },
};
