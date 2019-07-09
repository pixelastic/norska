import config from 'norska-config';
import helper from 'norska-helper';
import path from 'path';
import { _, pMap } from 'golgoth';
import firost from 'firost';
import pug from 'pug';

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
   * Returns an object containing path information about the specified file.
   * Those path will be injected in the data passed to the render to be used in
   * pug directly.
   * @param {string} filepath Path to the destination created
   * @returns {object} Object containing path information, with the following
   * keys:
   * - basename: The filename (like index.html)
   * - dirname: The relative path from the root to the directory (like
   *   blog/2019)
   * - toRoot: The relative prefix from the file, to the root (like: ../..)
   **/
  getPaths(filepath) {
    const basename = path.basename(filepath);
    const absoluteDirname = path.dirname(filepath);
    const absoluteDestination = config.to();

    const dirname = _.chain(absoluteDirname)
      .replace(new RegExp(`^${absoluteDestination}`), '')
      .trim('/')
      .value();
    const toRoot = path.relative(absoluteDirname, absoluteDestination) || '.';
    return {
      basename,
      dirname,
      toRoot,
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

    const compiler = pug.compileFile(absoluteSource, {
      filename: absoluteSource,
      basedir: config.from(),
    });
    const globalSiteData = await helper.siteData();
    const localPathData = this.getPaths(absoluteDestination);
    const data = {
      ...globalSiteData,
      paths: localPathData,
    };

    const result = compiler(data);
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

  // Listen to changes in pug and update
  async watch() {
    // Reload a given pug file whenever it is changed
    const pugFilesPattern = await this.pugFilesPattern();
    await firost.watch(pugFilesPattern, async filepath => {
      await this.compile(filepath);
    });

    // Reload all pug files whenever the _data.json is changed
    const dataPath = config.fromPath('_data.json');
    await firost.watch(dataPath, async () => {
      // Clear the cache so we don't read a stale data
      helper.clearSiteData();
      await this.run();
    });

    // Rebuild everything whenever an included file changes
    const pugIncludePatterns = [`${config.from()}/_includes/**/*.pug`];
    await firost.watch(pugIncludePatterns, async () => {
      await this.run();
    });
  },
};
