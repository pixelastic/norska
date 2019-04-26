import assets from 'norska-assets';
import config from 'norska-config';
import css from 'norska-css';
import html from 'norska-html';
import js from 'norska-js';
import liveServer from 'live-server';
import { pAll, firost } from 'golgoth';

export default {
  async run(argsConfig) {
    await config.init({
      args: argsConfig,
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

    // Stop if no live-reload
    if (!config.get('watch')) {
      return;
    }

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
};
