const config = require('norska-config');
const norskaData = require('norska-data');
const path = require('path');
const EventEmitter = require('events');
const { chalk, pMap, timeSpan, _ } = require('golgoth');
const {
  consoleError,
  consoleSuccess,
  consoleWarn,
  glob,
  spinner,
  watch,
  write,
} = require('firost');
const Gilmore = require('gilmore');
const markdown = require('./markdown/index.js');
const { pageUrl } = require('./path.js');
const pug = require('./pug/index.js');

module.exports = {
  /**
   * Compile all source files to html
   **/
  async run() {
    await this.init();

    const timer = timeSpan();
    const progress = this.__spinner();
    progress.tick('Compiling HTML');

    try {
      const filePatterns = await this.filePatterns();
      const files = await glob(filePatterns);
      await pMap(
        files,
        async (filepath) => {
          await this.compile(filepath);
        },
        { concurrency: 10 }
      );
    } catch (error) {
      progress.failure('HTML compilation failed');
      throw error;
    }

    // Running hook
    await config.get('hooks.afterHtml')({
      createPage: pug.compile.bind(pug),
    });

    await this.writeSitemap();

    progress.success(`HTML compiled in ${timer.rounded()}ms`);
    this.pulse.emit('run');
  },
  /**
   * Listen to any relevant change and rebuild html
   **/
  async watch() {
    await this.init();

    // Reload files when changed
    const filePatterns = await this.filePatterns();
    await watch(filePatterns, async (filepath) => {
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

    // Reload everything whenever the data in _data is changed
    const dataPatterns = [
      config.fromPath('_data/**/*.{js,json}'),
      config.themeFromPath('_data/**/*.{js,json}'),
    ];
    await watch(dataPatterns, async () => {
      await norskaData.updateCache();
      await this.run();
    });

    // Rebuild everything whenever an included file changes
    const includePatterns = [
      config.fromPath('_includes/**/*'),
      config.themeFromPath('_includes/**/*'),
    ];
    await watch(includePatterns, async () => {
      await this.run();
    });

    // Rebuild everything whenever the list of jsFiles to include changes
    config.pulse.on('set', async (key) => {
      if (key !== 'runtime.jsFiles') {
        return;
      }
      await this.run();
    });
  },
  /**
   * Compile a file from source into destination
   * @param {string} inputFile Absolute path to the source file
   * @returns {boolean} True on success, false otherwise
   **/
  async compile(inputFile) {
    // We only compile files that are in the source directory
    const sourceFolder = config.from();
    const absoluteSource = config.fromPath(inputFile);
    if (!_.startsWith(absoluteSource, sourceFolder)) {
      this.__consoleWarn(
        `${absoluteSource} compilation aborted. It is not in the source directory.`
      );
      return false;
    }

    const relativeSource = path.relative(sourceFolder, absoluteSource);
    const relativeDestination = this.getDestinationPath(relativeSource);

    const extname = path.extname(relativeSource).toLowerCase();
    const compilers = {
      '.pug': pug.compile.bind(pug),
      '.md': markdown.compile.bind(markdown),
    };
    await compilers[extname](relativeSource, relativeDestination);
  },
  /**
   * Read all data from _data and expose some values to the runtime config
   * - runtime.gitCommit contains the latest git commit hash, to be used for
   *   revving urls
   * - runtime.productionUrl contains the default url and is used to make remote urls
   **/
  async init() {
    await norskaData.warmCache();
    // Save the pug mixins in cache
    await pug.init();

    const repo = new Gilmore(config.root());
    const gitCommit = await repo.currentCommit();
    config.set('runtime.gitCommit', gitCommit);

    const data = norskaData.getAll();
    const productionUrl = _.get(data, 'meta.productionUrl');
    config.set('runtime.productionUrl', productionUrl);
  },
  /**
   * Returns a pattern list matching all files that should be compiled to HTML
   * @returns {Array} List of pattern to glob
   **/
  async filePatterns() {
    const source = config.from();
    return [
      `${source}/**/*.pug`,
      `${source}/**/*.md`,
      `!${source}/**/_*/**/*.pug`,
      `!${source}/**/_*/**/*.md`,
    ];
  },
  /**
   * Return the path to the output file from an input file
   * This will create pretty urls, using the basename as a directory name and
   * creating an index.html file
   * @param {string} inputPath Path to the source file
   * @returns {string} Path to the destination html file
   **/
  getDestinationPath(inputPath) {
    const extname = path.extname(inputPath);
    const basename = path.basename(inputPath, extname);
    const regexp = new RegExp(`${extname}$`);
    if (basename === 'index') {
      return inputPath.replace(regexp, '.html');
    }

    return inputPath.replace(regexp, '/index.html');
  },
  /**
   * Returns the sitemap.xml content from the list of build files
   * @returns {string} XML repesentation of the sitemap
   **/
  getSitemap() {
    const blocklist = ['404/index.html'];
    const urlList = _.chain(config.get('runtime.htmlFiles'))
      .values()
      .difference(blocklist)
      .map(pageUrl)
      .sort()
      .map((url) => {
        return `<url><loc>${url}</loc></url>`;
      })
      .join('')
      .value();

    return [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urlList,
      '</urlset>',
    ].join('');
  },
  /**
   * Write a sitemap to disk
   **/
  async writeSitemap() {
    const destination = config.toPath('sitemap.xml');
    const content = this.getSitemap();
    await write(content, destination);
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
