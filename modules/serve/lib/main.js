const js = require('norska-js');
const html = require('norska-html');
const css = require('norska-css');
const assets = require('norska-assets');
const config = require('norska-config');
const pAll = require('golgoth/pAll');
const express = require('express');
const open = require('open');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const consoleInfo = require('firost/consoleInfo');

module.exports = {
  /**
   * Start live reload server.
   * Listen to file changes, serve them locally, and refresh browser on change
   **/
  async run() {
    await this.watchFiles();
    await this.startStaticServer();
    await this.startLivereloadServer();
  },
  /**
   * Watch for changes in any source file and rebuild them in destination folder
   **/
  async watchFiles() {
    await pAll([
      async () => await html.watch(),
      async () => await css.watch(),
      async () => await js.watch(),
      async () => await assets.watch(),
    ]);
  },
  /**
   * Start a server rendering any file located in destination folder
   * @returns {Promise} Resolves when the server is started
   **/
  async startStaticServer() {
    return new Promise((resolve, _reject) => {
      const app = express();

      // Add the livereload.js script to the pages
      app.use(connectLivereload());

      app.use(express.static(config.toPath()));

      // Start the server
      const cmsPort = config.get('port');
      this.__staticServer = app.listen(cmsPort, async () => {
        const serverUrl = `http://127.0.0.1:${cmsPort}/`;
        this.__consoleInfo(`Dev server available at ${serverUrl}`);
        await this.__open(serverUrl);
        resolve();
      });
    });
  },
  /**
   * Close the previously opened static server
   * @returns {Promise} Resolve when the server is closed
   **/
  async closeStaticServer() {
    if (!this.__staticServer) {
      return;
    }
    // We give it the order to close, but only resolve once it is closed for
    // real
    return await new Promise((resolve) => {
      this.__staticServer.on('close', resolve);
      this.__staticServer.close();
    });
  },
  async startLivereloadServer() {
    const livereloadOptions = {
      delay: 200,
    };
    const watchedDirectories = [config.to()];

    this.__livereload()
      .createServer(livereloadOptions)
      .watch(watchedDirectories);
  },
  /**
   * Wrapping the livereload dependency so we can mock it in tests
   * @returns {object} Livereload object
   **/
  __livereload() {
    return livereload;
  },
  __open: open,
  __server: null,
  __consoleInfo: consoleInfo,
};
