import path from 'path';
import config from 'norska-config';
import express from 'express';
import firost from 'firost';
import norskaCss from 'norska-css';
import helper from 'norska-helper';
import { _ } from 'golgoth';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';

export default {
  /**
   * Default plugin configuration
   * @returns {object} Default plugin configuration
   **/
  defaultConfig() {
    return {
      port: 3000,
    };
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
   * Path to the app pages definitions
   * @returns {string} Path to the pages folder
   **/
  pagesPath() {
    return path.resolve(__dirname, 'pages');
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

      // Where are the static assets
      app.use(express.static(this.staticPath()));

      // Custom pages
      app.get('/', this.page('index'));
      app.get('/edit/:fileName', this.page('edit'));
      app.post('/update/:fileName', this.page('update'));

      // Add the livereload.js script to the pages
      app.use(connectLivereload());

      // Start the server
      const cmsPort = config.get('cms.port');
      app.listen(cmsPort, () => {
        console.info(`CMS available at http://127.0.0.1:${cmsPort}/`);
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
      exts: ['gif', 'html', 'ico', 'jpg', 'js', 'png', 'pug', 'svg'],
    };
    // Reload the browser whenever a page, view or asset is updated
    const pagesPath = this.pagesPath();
    const viewsPath = this.viewsPath();
    const staticPath = this.staticPath();
    const watchedDirectories = [pagesPath, viewsPath, staticPath];
    this.__livereload()
      .createServer(livereloadOptions)
      .watch(watchedDirectories);

    // Whenever a page is updated, we clear the node require cache, so the new
    // version is correctly reloaded
    const pagesGlob = `${pagesPath}/*.js`;
    await firost.watch(pagesGlob, filepath => {
      this.__removeFromRequireCache(filepath);
    });
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
    return function(req, res) {
      return helper.require(pagePath).default(req, res);
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
    const cssContent = await firost.read(sourceCssPath);
    const cssCompiler = await norskaCss.getCompiler();
    const compilationResult = await cssCompiler(cssContent, {
      from: sourceCssPath,
    });
    const compiledCss = _.get(compilationResult, 'css');

    await firost.write(compiledCss, destinationCssPath);
  },
  /**
   * Delete an entry from the node require cache.
   * We need to wrap this into its own method to be able to mock it in tests, as
   * the builtin require is not available through Jest
   * @param {string} id Module identifier
   **/
  __removeFromRequireCache(id) {
    delete require.cache[id];
  },
  /**
   * Wrapping the livereload dependency so we can mock it in tests
   * @returns {object} Livereload object
   **/
  __livereload() {
    return livereload;
  },
};
