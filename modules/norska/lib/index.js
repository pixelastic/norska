import assets from 'norska-assets';
import config from 'norska-config';
import css from 'norska-css';
import html from 'norska-html';
import js from 'norska-js';
import screenshot from 'norska-screenshot';
import liveServer from 'live-server';
import { _, pAll, firost } from 'golgoth';

export default {
  /**
   * Init the config singleton. Allow overwriting default values.
   * Modules are loaded in their own key, so they can more easily be merged with
   * user values later on
   * @param {Object} options Options to overwrite default values.
   *  - {Number} port (default 8083) Port where the liveserver will be opened
   *  - {Number} from (default ./src) Source directory
   *  - {Number} to (default ./dist) Destination directory
   *  @returns {Void}
   **/
  async init(options) {
    const safelist = ['from', 'to', 'port'];
    const safeOptions = _.pick(options, safelist);
    await config.init({
      safeOptions,
      modules: {
        css: css.config(),
        assets: assets.config(),
      },
    });
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
