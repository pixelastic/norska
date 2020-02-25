const module = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/lib/emptyDir');
const exists = require('firost/lib/exists');
const isFile = require('firost/lib/isFile');
const mkdirp = require('firost/lib/mkdirp');
const unwatchAll = require('firost/lib/unwatchAll');
const waitForWatchers = require('firost/lib/waitForWatchers');
const write = require('firost/lib/write');
const remove = require('firost/lib/remove');
const read = require('firost/lib/read');

describe('norska-assets', () => {
  describe('globs', () => {
    it('should prepend the from path to all entries', async () => {
      await config.init({
        from: './tmp/norska-assets/src',
        to: './tmp/norska-assets/dist',
        assets: {
          files: ['**/*.foo', '**/*.bar'],
        },
      });
      const actual = module.globs();

      expect(actual).toEqual([
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
        assets: module.defaultConfig(),
      });
      await emptyDir('./tmp/norska-assets');
    });
    it('should copy file to root of destination', async () => {
      const filename = 'favicon.ico';

      const input = config.fromPath(filename);
      const output = config.toPath(filename);
      await write('dummy', input);
      await module.compile(input);

      const actual = await isFile(output);
      expect(actual).toEqual(true);
    });
    it('should copy file to subfolder', async () => {
      const filename = 'deep/folder/favicon.ico';

      const input = config.fromPath(filename);
      const output = config.toPath(filename);
      await write('dummy', input);
      await module.compile(input);

      const actual = await isFile(output);
      expect(actual).toEqual(true);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-assets/src',
        to: './tmp/norska-assets/dist',
        assets: module.defaultConfig(),
      });
      await emptyDir('./tmp/norska-assets');
      jest
        .spyOn(module, '__spinner')
        .mockReturnValue({ text() {}, tick() {}, success() {}, failure() {} });
    });
    describe('images', () => {
      it('should copy gif files', async () => {
        const filepath = 'images/foo.gif';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy jpg files', async () => {
        const filepath = 'images/foo.jpg';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy png files', async () => {
        const filepath = 'images/foo.png';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy svg files', async () => {
        const filepath = 'images/foo.svg';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy ico files', async () => {
        const filepath = 'images/foo.ico';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
    });
    describe('fonts', () => {
      it('should copy eot files', async () => {
        const filepath = 'fonts/foo.eot';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy otf files', async () => {
        const filepath = 'fonts/foo.otf';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy ttf files', async () => {
        const filepath = 'fonts/foo.ttf';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy woff files', async () => {
        const filepath = 'fonts/foo.woff';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
    });
    describe('documents', () => {
      it('should copy pdf files', async () => {
        const filepath = 'documents/foo.pdf';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
    });
    describe('Netlify config', () => {
      it('should copy _redirects file', async () => {
        const filepath = '_redirects';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy _headers file', async () => {
        const filepath = '_headers';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy netlify.toml', async () => {
        const filepath = 'netlify.toml';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
    });
    describe('misc', () => {
      it('should not copy unknown files', async () => {
        const filepath = 'foo.weird';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(false);
      });
      it('should copy html files', async () => {
        const filepath = 'index.html';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy txt files', async () => {
        const filepath = 'robots.txt';

        await write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
    });
    describe('spinner', () => {
      it('should contain the total number of files', async () => {
        const filepath = './subdir/foo.gif';

        await write('foo', config.fromPath(filepath));
        await module.run();

        expect(module.__spinner).toHaveBeenCalledWith(1);
      });
    });
  });
  describe('watch', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-assets/src',
        to: './tmp/norska-assets/dist',
        assets: module.defaultConfig(),
      });
      await emptyDir('./tmp/norska-assets');
      await mkdirp(config.from());
    });
    afterEach(async () => {
      await unwatchAll();
    });
    it('should not copy files initially', async () => {
      await write('foo', config.fromPath('foo.jpg'));
      await module.watch();

      const actual = await exists(config.toPath('foo.jpg'));
      expect(actual).toEqual(false);
    });
    it('should update files modified', async () => {
      await write('foo', config.fromPath('foo.jpg'));
      await module.watch();

      await write('bar', config.fromPath('foo.jpg'));
      await waitForWatchers();

      const actual = await read(config.toPath('foo.jpg'));

      expect(actual).toEqual('bar');
    });
    it('should copy files added', async () => {
      await module.watch();

      await write('foo', config.fromPath('foo.jpg'));
      await waitForWatchers();

      const actual = await read(config.toPath('foo.jpg'));
      expect(actual).toEqual('foo');
    });
    it('should copy files added in subfolder', async () => {
      await module.watch();

      await write('foo', config.fromPath('./images/foo.jpg'));
      await waitForWatchers();

      const actual = await read(config.toPath('./images/foo.jpg'));
      expect(actual).toEqual('foo');
    });
    it('should delete files deleted', async () => {
      await module.watch();

      await write('foo', config.fromPath('foo.jpg'));
      await waitForWatchers();
      await remove(config.fromPath('foo.jpg'));
      await waitForWatchers();

      const actual = await exists(config.toPath('foo.jpg'));
      expect(actual).toEqual(false);
    });
  });
});
