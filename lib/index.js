import html from './html';
import css from './css';
import js from './js';
import pAll from 'p-all';
import firost from 'firost';
import assets from './assets';
import config from './config';

export default {
  async run(userConfig) {
    config.init(userConfig);
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
};
