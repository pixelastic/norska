const js = require('norska-js');
const html = require('norska-html');
const css = require('norska-css');
const assets = require('norska-assets');
const config = require('norska-config');
const pAll = require('golgoth/pAll');
const express = require('express');
const open = require('open');

module.exports = {
  async run() {
    await this.watchFiles();
    await this.startServer();
  },
  async startServer() {
    return new Promise((resolve, _reject) => {
      const app = express();
  
      app.use(express.static(config.to()));

      // Add the livereload.js script to the pages
      // app.use(connectLivereload());

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
  async watchFiles() {
    await pAll([
      async () => await html.watch(),
      async () => await css.watch(),
      async () => await js.watch(),
      async () => await assets.watch(),
    ]);
  }
};
