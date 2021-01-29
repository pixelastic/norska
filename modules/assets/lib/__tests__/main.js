const current = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/emptyDir');
const exists = require('firost/exists');
const isFile = require('firost/isFile');
const mkdirp = require('firost/mkdirp');
const unwatchAll = require('firost/unwatchAll');
const waitForWatchers = require('firost/waitForWatchers');
const write = require('firost/write');
const remove = require('firost/remove');
const read = require('firost/read');
const pMap = require('golgoth/pMap');
const glob = require('firost/glob');
const _ = require('golgoth/lodash');

describe('norska-assets', () => {
  describe('globs', () => {
    it('should find the globs in both source and theme', async () => {
      await config.init({
        from: './tmp/norska-assets/src',
        to: './tmp/norska-assets/dist',
        assets: {
          files: ['**/*.foo', '**/*.bar'],
        },
      });
      const actual = current.globs();

      expect(actual).toEqual([
        config.themePath('**/*.foo'),
        config.themePath('**/*.bar'),
        config.fromPath('**/*.foo'),
        config.fromPath('**/*.bar'),
      ]);
    });
  });
  describe('compile', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-assets/src',
        to: './tmp/norska-assets/dist',
        theme: './tmp/norska-assets/theme',
        assets: current.defaultConfig(),
      });
      await emptyDir('./tmp/norska-assets');
    });
    it.each([
      ['from:/favicon.ico', 'favicon.ico'],
      ['from:/sub/folder/favicon.ico', 'sub/folder/favicon.ico'],
      ['theme:/assets/logo.png', 'assets/logo.png'],
    ])('%s', async (input, expected) => {
      const sourceFilename = _.chain(input)
        .replace('from:', config.from())
        .replace('theme:', config.from())
        .value();

      await write('dummy content', sourceFilename);
      await current.compile(sourceFilename);
      expect(await isFile(config.toPath(expected))).toEqual(true);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-assets/src',
        to: './tmp/norska-assets/dist',
        theme: './tmp/norska-assets/theme',
        assets: current.defaultConfig(),
      });
      await emptyDir('./tmp/norska-assets');
      jest
        .spyOn(current, '__spinner')
        .mockReturnValue({ text() {}, tick() {}, success() {}, failure() {} });
    });
    it('should copy only needed files', async () => {
      const input = {
        from: [
          'assets/fonts/verdana.eot',
          'assets/fonts/verdana.otf',
          'assets/fonts/verdana.ttf',
          'assets/fonts/verdana.woff2',
          'assets/fonts/verdana.woff',
          'assets/images/funny.gif',
          'assets/images/icon.svg',
          'assets/images/picture.png',
          'awesome/structure/with/keywords/seo.html',
          'documents/invoice.pdf',
          'favicon.ico',
          'favicon.png',
          'download.part',
          'index.pug',
          'robots.txt',
          '.envrc',
        ],
        theme: [
          'script.js',
          'style.css',
          'assets/fonts/amaranth.eot',
          'assets/fonts/amaranth.svg',
          'assets/fonts/amaranth.ttf',
          'assets/fonts/amaranth.woff',
        ],
      };

      const expected = [
        'assets/fonts/amaranth.eot',
        'assets/fonts/amaranth.svg',
        'assets/fonts/amaranth.ttf',
        'assets/fonts/amaranth.woff',
        'assets/fonts/verdana.eot',
        'assets/fonts/verdana.otf',
        'assets/fonts/verdana.ttf',
        'assets/fonts/verdana.woff',
        'assets/fonts/verdana.woff2',
        'assets/images/funny.gif',
        'assets/images/icon.svg',
        'assets/images/picture.png',
        'awesome/structure/with/keywords/seo.html',
        'documents/invoice.pdf',
        'favicon.ico',
        'favicon.png',
        'robots.txt',
      ];

      // Write all files in source directories
      await pMap(input.from, async (filepath) => {
        await write('dummy content', config.fromPath(filepath));
      });
      await pMap(input.theme, async (filepath) => {
        await write('dummy content', config.themePath(filepath));
      });

      await current.run();

      // Get list of files in output directory
      const actual = _.chain(
        await glob(config.toPath('**/*'), { directories: false })
      )
        .map((filepath) => {
          return _.replace(filepath, `${config.to()}/`, '');
        })
        .value();

      expect(actual).toEqual(expected);
    });
    describe('spinner', () => {
      it('should contain the total number of files', async () => {
        const filepath = './subdir/foo.gif';

        await write('foo', config.fromPath(filepath));
        await current.run();

        expect(current.__spinner).toHaveBeenCalledWith(1);
      });
    });
  });
  describe('watch', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-assets/src',
        to: './tmp/norska-assets/dist',
        assets: current.defaultConfig(),
      });
      await emptyDir('./tmp/norska-assets');
      await mkdirp(config.from());
    });
    afterEach(async () => {
      await unwatchAll();
    });
    it('should not copy files initially', async () => {
      await write('foo', config.fromPath('foo.jpg'));
      await current.watch();

      const actual = await exists(config.toPath('foo.jpg'));
      expect(actual).toEqual(false);
    });
    it('should update files modified', async () => {
      await write('foo', config.fromPath('foo.jpg'));
      await current.watch();

      await write('bar', config.fromPath('foo.jpg'));
      await waitForWatchers();

      const actual = await read(config.toPath('foo.jpg'));

      expect(actual).toEqual('bar');
    });
    it('should copy files added', async () => {
      await current.watch();

      await write('foo', config.fromPath('foo.jpg'));
      await waitForWatchers();

      const actual = await read(config.toPath('foo.jpg'));
      expect(actual).toEqual('foo');
    });
    it('should copy files added in subfolder', async () => {
      await current.watch();

      await write('foo', config.fromPath('./images/foo.jpg'));
      await waitForWatchers();

      const actual = await read(config.toPath('./images/foo.jpg'));
      expect(actual).toEqual('foo');
    });
    it('should delete files deleted', async () => {
      await current.watch();

      await write('foo', config.fromPath('foo.jpg'));
      await waitForWatchers();
      await remove(config.fromPath('foo.jpg'));
      await waitForWatchers();

      const actual = await exists(config.toPath('foo.jpg'));
      expect(actual).toEqual(false);
    });
  });
});
