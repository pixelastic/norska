import assets from 'norska-assets';
import config from 'norska-config';
import css from 'norska-css';
import html from 'norska-html';
import js from 'norska-js';
import liveServer from 'live-server';
import { pAll, firost } from 'golgoth';

export default {
  /**
   * Build the website from source to destination
   * @param {Object} options Options to overwrite default values.
   *  - {Number} port (default 8083) Port where the liveserver will be opened
   *  - {Number} from (default ./src) Source directory
   *  - {Number} to (default ./dist) Destination directory
   * @returns {Void}
   **/
  async build(options) {
    await config.init({
      options,
      modules: {
        css: css.config(),
        assets: assets.config(),
      },
    });
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
  async watch(options) {
    await this.build(options);

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
  // async screenshot(options) {
  //   console.info(options);
  // },
};
