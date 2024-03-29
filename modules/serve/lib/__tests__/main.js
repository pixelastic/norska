const current = require('../main');
const assets = require('norska-assets');
const js = require('norska-js');
const css = require('norska-css');
const html = require('norska-html');
const config = require('norska-config');
const emptyDir = require('firost/emptyDir');
const readUrl = require('firost/readUrl');
const write = require('firost/write');

describe('norska-serve', () => {
  const tmpDirectory = './tmp/norska-serve';

  // Static server port is only set once the static server is launched
  /**
   *
   */
  function staticServerUrl() {
    const staticServerPort = config.get('port');
    return `http://127.0.0.1:${staticServerPort}`;
  }

  describe('watchFiles', () => {
    it('should listen to changes', async () => {
      jest.spyOn(html, 'watch').mockReturnValue();
      jest.spyOn(css, 'watch').mockReturnValue();
      jest.spyOn(js, 'watch').mockReturnValue();
      jest.spyOn(assets, 'watch').mockReturnValue();

      await current.watchFiles();

      expect(html.watch).toHaveBeenCalled();
      expect(css.watch).toHaveBeenCalled();
      expect(js.watch).toHaveBeenCalled();
      expect(assets.watch).toHaveBeenCalled();
    });
  });
  describe('startStaticServer', () => {
    beforeEach(async () => {
      await emptyDir(tmpDirectory);

      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
      });

      jest.spyOn(current, '__consoleInfo').mockReturnValue();
      jest.spyOn(current, '__open').mockReturnValue();
    });
    afterEach(async () => {
      await current.closeStaticServer();
    });
    it('should serve files from the dist folder', async () => {
      await write('some content', config.toPath('index.html'));

      await current.startStaticServer();

      const actual = await readUrl(staticServerUrl());
      expect(actual).toEqual('some content');
    });
    it('should serve fresh content', async () => {
      await write('some content', config.toPath('index.html'));
      await current.startStaticServer();

      const firstRead = await readUrl(staticServerUrl());
      expect(firstRead).toEqual('some content');

      await write('updated content', config.toPath('index.html'));
      const secondRead = await readUrl(staticServerUrl(), {
        memoryCache: false,
      });
      expect(secondRead).toEqual('updated content');
    });
    it('should serve content added after server starts', async () => {
      await current.startStaticServer();

      await write('some content', config.toPath('index.html'));

      const actual = await readUrl(staticServerUrl());
      expect(actual).toEqual('some content');
    });
    it('should add liveReload script to html pages', async () => {
      await write(
        '<!DOCTYPE html><html><body>some content</body></html>',
        config.toPath('index.html')
      );
      jest.spyOn(current, 'getLivereloadPort').mockReturnValue(35729);

      await current.startStaticServer();

      const actual = await readUrl(staticServerUrl(), {
        headers: { Accept: 'text/html' },
      });
      expect(actual).toInclude(
        '<script src="//127.0.0.1:35729/livereload.js?snipver=1"'
      );
    });
  });

  describe('assignPort', () => {
    beforeEach(async () => {
      await config.init({});
    });
    it('should do nothing if the port is already set', async () => {
      await config.init({
        port: 1234,
      });

      await current.assignPort();

      const actual = config.get('port');
      expect(actual).toEqual(1234);
    });
    it('should pick a random port if no port is set', async () => {
      await current.assignPort();

      const actual = config.get('port');
      expect(actual).not.toBeNull();
    });
  });
});
