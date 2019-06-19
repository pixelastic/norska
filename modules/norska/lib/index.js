import assets from 'norska-assets';
import config from 'norska-config';
import css from 'norska-css';
import html from 'norska-html';
import js from 'norska-js';
import screenshot from 'norska-screenshot';
import liveServer from 'live-server';
import { pAll } from 'golgoth';
import firost from 'firost';

export default {
  async init(cliArgs) {
    const modulesConfig = {
      css: css.config(),
      assets: assets.defaultConfig(),
    };
    await config.init(cliArgs, modulesConfig);
  },
  /**
   * Build the website from source to destination
   * @returns {Void}
   **/
  async build() {
    await firost.mkdirp(config.to());

    await pAll([
      async () => {
        await html.run();
        await css.run();
      },
      async () => await js.run(),
      async () => await assets.run(),
    ]);
  },
  async watch() {
    await this.build();

    html.watch();
    css.watch();
    js.watch();
    assets.watch();

    liveServer.start({
      root: config.to(),
      port: config.get('port'),
      ignore: 'assets',
    });
  },
  async screenshot(options) {
    await screenshot.run(options);
  },
};
