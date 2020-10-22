const PercyScript = require('@percy/script');
const exit = require('firost/exit');
const consoleError = require('firost/consoleError');
const consoleInfo = require('firost/consoleInfo');
const glob = require('firost/glob');
const httpServer = require('http-server');
const pMap = require('golgoth/lib/pMap');
const path = require('path');
const run = require('firost/run');

const percy = {
  config: {
    servePath: path.resolve('./modules/docs/dist'),
    servePort: '8090',
  },
  async run() {
    await this.buildDocumentation();

    const config = this.config;
    let pagesToSnapshot = await glob(`${config.servePath}/percy/**/index.html`);
    PercyScript.run(async (page, percySnapshot) => {
      let server = httpServer.createServer({ root: config.servePath });
      server.listen(config.servePort);

      await pMap(
        pagesToSnapshot,
        async (pageToSnapshot) => {
          const pageName = path.basename(path.dirname(pageToSnapshot));
          const pagePath = pageToSnapshot.replace(config.servePath, '');
          const pageUrl = `http://localhost:${config.servePort}${pagePath}`;

          await page.goto(pageUrl);
          await percySnapshot(pageName);
        },
        { concurrency: 1 }
      );

      server.close();
    });
  },

  async buildDocumentation() {
    try {
      consoleInfo('Building documentation website');
      await run('yarn run build');
    } catch (err) {
      consoleError('Documentation website build failed, exiting');
      exit(1);
    }
  },
};

(async () => {
  await percy.run();
})();
