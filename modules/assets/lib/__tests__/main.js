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
const newFile = require('firost/newFile');
const read = require('firost/read');
const pMap = require('golgoth/pMap');
const glob = require('firost/glob');
const _ = require('golgoth/lodash');
const path = require('path');

describe('norska-assets', () => {
  const tmpDirectory = path.resolve('./tmp/norska-assets');
  describe('getFiles', () => {
    beforeEach(async () => {
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        theme: `${tmpDirectory}/theme`,
        assets: current.defaultConfig(),
      });
      await emptyDir(tmpDirectory);
    });
    it.each([
      [
        'different files from theme and source',
        [
          `${tmpDirectory}/src/index.html`,
          `${tmpDirectory}/theme/src/favicon.svg`,
        ],
        [
          `${tmpDirectory}/src/index.html`,
          `${tmpDirectory}/theme/src/favicon.svg`,
        ],
      ],
      [
        'overlapping files from theme and source',
        [
          `${tmpDirectory}/src/favicon.svg`,
          `${tmpDirectory}/theme/src/favicon.svg`,
        ],
        [`${tmpDirectory}/src/favicon.svg`],
      ],
      [
        'ignoring files from directories starting with an underscore',
        [
          `${tmpDirectory}/src/index.html`,
          `${tmpDirectory}/src/_includes/ignored.html`,
          `${tmpDirectory}/src/_styles/style.css`,
        ],
        [`${tmpDirectory}/src/index.html`],
      ],
      [
        'files at the root as well as deeply nested',
        [
          `${tmpDirectory}/src/index.html`,
          `${tmpDirectory}/src/very/deep/nested/file.html`,
        ],
        [
          `${tmpDirectory}/src/index.html`,
          `${tmpDirectory}/src/very/deep/nested/file.html`,
        ],
      ],
    ])('%s', async (_title, files, expected) => {
      await pMap(files, newFile);

      const actual = await current.getFiles();

      expect(actual).toHaveLength(expected.length);
      _.each(expected, (filepath) => {
        expect(actual).toContainEqual(filepath);
      });
    });
  });
  describe('compile', () => {
    beforeEach(async () => {
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        theme: `${tmpDirectory}/theme`,
        assets: current.defaultConfig(),
      });
      await emptyDir(tmpDirectory);
    });
    it.each([
      ['from:/favicon.ico', 'favicon.ico'],
      ['from:/sub/folder/favicon.ico', 'sub/folder/favicon.ico'],
      ['theme:/assets/logo.png', 'assets/logo.png'],
    ])('%s', async (input, expected) => {
      const sourceFilename = _.chain(input)
        .replace('from:', config.from())
        .replace('theme:', config.themeFrom())
        .value();
      await newFile(sourceFilename);

      await current.compile(sourceFilename);
      expect(await isFile(config.toPath(expected))).toEqual(true);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        theme: `${tmpDirectory}/theme`,
        assets: current.defaultConfig(),
      });
      await emptyDir(tmpDirectory);
      jest
        .spyOn(current, '__spinner')
        .mockReturnValue({ text() {}, tick() {}, success() {}, failure() {} });
    });
    it('should copy only needed files', async () => {
      const input = {
        from: [
          'api/posts.json',
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
          'download.part',
          'favicon.ico',
          'favicon.png',
          'index.pug',
          'robots.txt',
          '.envrc',
          '_data/config.json',
          '_includes/icons/github.svg',
          '_scripts/__tests__/containerId.js',
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
        'api/posts.json',
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
        await newFile(config.fromPath(filepath));
      });
      await pMap(input.theme, async (filepath) => {
        await newFile(config.themeFromPath(filepath));
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

        await newFile(config.fromPath(filepath));
        await current.run();

        expect(current.__spinner).toHaveBeenCalledWith(1);
      });
    });
  });
  describe('watch', () => {
    beforeEach(async () => {
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        assets: current.defaultConfig(),
      });
      await emptyDir(tmpDirectory);
      await mkdirp(config.from());
    });
    afterEach(async () => {
      await unwatchAll();
    });
    it('should not copy files initially', async () => {
      await newFile(config.fromPath('test.txt'));
      await current.watch();

      const actual = await exists(config.toPath('test.txt'));
      expect(actual).toEqual(false);
    });
    it('should update files modified', async () => {
      await write('some content', config.fromPath('test.txt'));
      await current.watch();

      await write('updated content', config.fromPath('test.txt'));
      await waitForWatchers();

      const actual = await read(config.toPath('test.txt'));

      expect(actual).toEqual('updated content');
    });
    it('should copy files added', async () => {
      await current.watch();

      await newFile(config.fromPath('test.txt'));
      await waitForWatchers();

      const actual = await exists(config.toPath('test.txt'));
      expect(actual).toEqual(true);
    });
    it('should copy files added in subfolder', async () => {
      await current.watch();

      await newFile(config.fromPath('blog/test.txt'));
      await waitForWatchers();

      const actual = await exists(config.toPath('blog/test.txt'));
      expect(actual).toEqual(true);
    });
    it('should delete files deleted', async () => {
      await current.watch();

      await newFile(config.fromPath('test.txt'));
      await waitForWatchers();
      await remove(config.fromPath('test.txt'));
      await waitForWatchers();

      const actual = await exists(config.toPath('test.txt'));
      expect(actual).toEqual(false);
    });
  });
});
