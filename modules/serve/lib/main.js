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

module.exports = {
  async run() {
    await this.watchFiles();
    await this.startStaticServer();
    await this.startLivereloadServer();
  },
  async watchFiles() {
    await pAll([
      async () => await html.watch(),
      async () => await css.watch(),
      async () => await js.watch(),
      async () => await assets.watch(),
    ]);
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
  async startStaticServer() {
    return new Promise((resolve, _reject) => {
      const app = express();

      // Add the livereload.js script to the pages
      app.use(connectLivereload());

      app.use(express.static(config.to()));

      // Start the server
      const cmsPort = config.get('port');
      app.listen(cmsPort, async () => {
        const cmsUrl = `http://127.0.0.1:${cmsPort}/`;
        console.info(`Dev server available at ${cmsUrl}`);
        await open(cmsUrl);
        resolve();
      });
    });
  },
  /**
   * Wrapping the livereload dependency so we can mock it in tests
   * @returns {object} Livereload object
   **/
  __livereload() {
    return livereload;
  },
};
