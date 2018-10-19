import html from './html';
import css from './css';
import js from './js';
import assets from './assets';
import liveServer from 'live-server';
import pAll from 'p-all';

(async function() {
  await pAll([
    async () => {
      await html.run();
      await css.run();
    },
    async () => await js.run(),
    async () => await assets.run(),
  ]);

  html.watch();
  css.watch();
  js.watch();
  assets.watch();

  liveServer.start({
    root: './dist',
    port: 8083,
    ignore: 'assets',
  });
})();
