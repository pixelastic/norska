const path = require('path');
const config = require('norska-config');
const express = require('express');
const norskaCss = require('norska-css');
const _ = require('golgoth/lib/lodash');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const open = require('open');
const multer = require('multer');
const read = require('firost/lib/read');
const write = require('firost/lib/write');
const firostRequire = require('firost/lib/require');
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
   * Path to the views folder used by the app
   * @returns {string} Path to the views folder
   **/
  viewsPath() {
    return path.resolve(__dirname, '../server/views');
  },
  /**
   * Path to the static assets folder
   * @returns {string} Path to the static folder
   **/
  staticPath() {
    return path.resolve(__dirname, '../server/static');
  },
  /**
   * Path to the helper folder used by the app
   * @returns {string} Path to the helper folder
   **/
  helpersPath() {
    return path.resolve(__dirname, 'helpers');
  },
  /**
   * Path to the app pages definitions
   * @returns {string} Path to the pages folder
   **/
  pagesPath() {
    return path.resolve(__dirname, 'pages');
  },
  /**
   * Path to the data files in source
   * @returns {string} Path to the _data folder
   **/
  dataPath() {
    return config.fromPath('_data');
  },
  uploadPath() {
    return config.fromPath('uploads');
  },
  uploadTmpPath() {
    return '/tmp/norska-cms/upload';
  },
  /**
   * Start the CMS server
   * @returns {Promise} Resolves when server is ready
   **/
  async startServer() {
    return new Promise((resolve, _reject) => {
      const app = express();

      // Add form data to req.body
      app.use(express.urlencoded({ extended: true }));

      // Where are the views, and what engine to use
      app.set('views', this.viewsPath());
      app.set('view engine', 'pug');
      app.locals.basedir = this.viewsPath();

      // Where are the static assets of the CMS
      app.use(express.static(this.staticPath()));

      // Allow access to files in ./src directly
      app.use('/src', express.static(config.from()));

      const upload = multer({ dest: this.uploadTmpPath() });

      // Custom pages
      app.get('/', this.page('index'));
      app.get('/edit/:fileName', this.page('edit'));
      app.post('/update/:fileName', upload.any(), this.page('update'));

      // Add the livereload.js script to the pages
      app.use(connectLivereload());

      // Start the server
      const cmsPort = config.get('cms.port');
      app.listen(cmsPort, async () => {
        const cmsUrl = `http://127.0.0.1:${cmsPort}/`;
        console.info(`CMS available at ${cmsUrl}`);
        await open(cmsUrl);
        resolve();
      });
    });
  },
  /**
   * Start livereload capabilities.
   * Will reload the browser whenever a page, a view or a static asset is
   * updated
   **/
  async startLivereload() {
    const livereloadOptions = {
      exts: ['gif', 'html', 'ico', 'jpg', 'js', 'json', 'png', 'pug', 'svg'],
      // We need to add a slight delay so the browser does not reload as soon as
      // we write on disk in _data
      delay: 200,
    };
    // Reload the browser whenever a file in those folders is updated
    const dataPath = this.dataPath(); // The _data folder in source
    const helperPath = this.helpersPath(); // CMS helpers
    const pagesPath = this.pagesPath(); // Each CMS page
    const staticPath = this.staticPath(); // Static CMS assets
    const viewsPath = this.viewsPath(); // CMS views
    const watchedDirectories = [
      dataPath,
      helperPath,
      pagesPath,
      staticPath,
      viewsPath,
    ];
    this.__livereload()
      .createServer(livereloadOptions)
      .watch(watchedDirectories);
  },
  /**
   * Run the Norska CMS admin panel, with livereload enabled
   **/
  async run() {
    await this.startServer();
    await this.startLivereload();
  },
  /**
   * Returns an Express middleware based on the page name.
   * It will re-require the file whenever it is called, enabling us to always
   * reload the latest version because we're clearing the cache when those files
   * are modified
   * @param {string} pageName Basename of the page to load
   * @returns {Function} Express middleware
   **/
  page(pageName) {
    const pagePath = path.resolve(this.pagesPath(), `${pageName}.js`);
    return (req, res) => {
      return this.__require(pagePath, { forceReload: true })(req, res);
    };
  },
  /**
   * Rebuilds the CSS static file used by the app
   * This is internally using norska-css, so using the custom norska Tailwind
   * configuration
   **/
  async generateCssFile() {
    const sourceCssPath = path.resolve(__dirname, '../src/css/style.css');
    const destinationCssPath = path.resolve(this.staticPath(), 'css/style.css');
    const cssContent = await read(sourceCssPath);
    const cssCompiler = await norskaCss.getCompiler();
    const compilationResult = await cssCompiler(cssContent, {
      from: sourceCssPath,
    });
    const compiledCss = _.get(compilationResult, 'css');

    await write(compiledCss, destinationCssPath);
  },
  /**
   * Wrapping the livereload dependency so we can mock it in tests
   * @returns {object} Livereload object
   **/
  __livereload() {
    return livereload;
  },
  __require: firostRequire,
};
