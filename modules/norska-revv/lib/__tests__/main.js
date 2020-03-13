const module = require('../main');
const config = require('norska-config');
const helper = require('norska-helper');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const read = require('firost/lib/read');
const glob = require('firost/lib/glob');

describe('norska-revv', () => {
  beforeEach(async () => {
    await config.init({
      from: './tmp/norska-revv/src',
      to: './tmp/norska-revv/dist',
    });
    await emptyDir('./tmp/norska-revv');
    config.set('runtime.revvFiles', {});
    jest
      .spyOn(module, '__spinner')
      .mockReturnValue({ tick() {}, success() {}, info() {} });
  });
  describe('manifest', () => {
    it('should return an empty object if no manifest yet set', () => {
      const actual = module.manifest();

      expect(actual).toEqual({});
    });
    it('should write if value passed, read if not', () => {
      module.manifest({ foo: 'bar' });

      const actual = module.manifest();

      expect(actual).toEqual({ foo: 'bar' });
    });
  });
  describe('add', () => {
    it('should add a null entry to the manifest', () => {
      module.add('foo/bar.js');

      const actual = module.manifest();

      expect(actual).toHaveProperty(['foo/bar.js'], null);
    });
  });
  describe('revvPath', () => {
    it('keep same path if file does not exist', async () => {
      const actual = await module.revvPath('foo.txt');

      expect(actual).toEqual('foo.txt');
    });
    describe('with default method', () => {
      it('return revved filepath of file', async () => {
        await write('foo', config.toPath('foo.txt'));

        const actual = await module.revvPath('foo.txt');

        expect(actual).toEqual('foo.acbd18db4c.txt');
      });
      it('return different filepath if content is different', async () => {
        await write('foo', config.toPath('foo.txt'));
        const revv1 = await module.revvPath('foo.txt');
        await write('bar', config.toPath('foo.txt'));
        const revv2 = await module.revvPath('foo.txt');

        expect(revv1).not.toEqual(revv2);
      });
    });
    describe('with custom method', () => {
      it('should use the custom method returned value', async () => {
        await config.init({
          from: './tmp/norska-revv/src',
          to: './tmp/norska-revv/dist',
          revv: {
            hashingMethod(_filepath) {
              return 'bar.baz';
            },
          },
        });
        await write('foo', config.toPath('foo.txt'));

        const actual = await module.revvPath('foo.txt');

        expect(actual).toEqual('bar.baz');
      });
    });
  });
  describe('fillManifest', () => {
    it('should add revved filepath to each file in the manifest', async () => {
      await write('foo', config.toPath('foo.txt'));
      await write('bar', config.toPath('bar.txt'));
      module.add('foo.txt');
      module.add('bar.txt');

      await module.fillManifest();

      const actual = module.manifest();

      expect(actual).toHaveProperty(['foo.txt'], 'foo.acbd18db4c.txt');
      expect(actual).toHaveProperty(['bar.txt'], 'bar.37b51d194a.txt');
    });
  });
  describe('compile', () => {
    beforeEach(async () => {
      await write('foo', config.toPath('foo.txt'));
      module.add('foo.txt');
      await module.fillManifest();
    });
    it('should replace occurences of {revv: input} with revved path', async () => {
      const input = config.toPath('index.html');
      await write('<a href="{revv: foo.txt}">foo</a>', input);

      await module.compile(input);

      const actual = await read(input);

      expect(actual).toEqual('<a href="foo.acbd18db4c.txt">foo</a>');
    });
    it('should replace all occurences', async () => {
      const input = config.toPath('index.html');
      await write(
        '<a href="{revv: foo.txt}">foo</a><a href="{revv: foo.txt}">foo</a>',
        input
      );

      await module.compile(input);

      const actual = await read(input);

      expect(actual).toEqual(
        '<a href="foo.acbd18db4c.txt">foo</a><a href="foo.acbd18db4c.txt">foo</a>'
      );
    });
    it('should work in deep nested files', async () => {
      const input = config.toPath('./deep/nested/file/index.html');
      await write('<a href="{revv: foo.txt}">foo</a>', input);

      await module.compile(input);

      const actual = await read(input);

      expect(actual).toEqual('<a href="../../../foo.acbd18db4c.txt">foo</a>');
    });
  });
  describe('renameAssets', () => {
    it('should create a revved copy of each file in manifest', async () => {
      await write('foo', config.toPath('foo.txt'));
      module.add('foo.txt');
      await module.fillManifest();

      await module.renameAssets();

      const actual = await glob(config.toPath('**/*'));
      expect(actual).toInclude(config.toPath('foo.acbd18db4c.txt'));
    });
    it('should keep the initial file as well', async () => {
      await write('foo', config.toPath('foo.txt'));
      module.add('foo.txt');
      await module.fillManifest();

      await module.renameAssets();

      const actual = await glob(config.toPath('**/*'));
      expect(actual).toInclude(config.toPath('foo.txt'));
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'isProduction').mockReturnValue(true);

      await write('foo', config.toPath('foo.txt'));
      module.add('foo.txt');
    });
    it('should update all html files in destination', async () => {
      const html = '<a href="{revv: foo.txt}">foo</a>';
      const index = config.toPath('index.html');
      const subfile = config.toPath('subdir/deep/index.html');
      await write(html, index);
      await write(html, subfile);

      await module.run();

      const expected = '<a href="foo.acbd18db4c.txt">foo</a>';
      const expectedSubfile = '<a href="../../foo.acbd18db4c.txt">foo</a>';

      expect(await read(index)).toEqual(expected);
      expect(await read(subfile)).toEqual(expectedSubfile);
    });
    it('should not run in dev', async () => {
      jest.spyOn(helper, 'isProduction').mockReturnValue(false);
      const html = '<a href="{revv: foo.txt}">foo</a>';
      const index = config.toPath('index.html');
      const subfile = config.toPath('subdir/deep/index.html');
      await write(html, index);
      await write(html, subfile);

      await module.run();

      const expected = html;

      expect(await read(index)).toEqual(expected);
      expect(await read(subfile)).toEqual(expected);
    });
    it('should have renamed files', async () => {
      await module.run();

      const actual = await glob(config.toPath('**/*'));

      expect(actual).toInclude(config.toPath('foo.acbd18db4c.txt'));
    });
    it('should have kept initial files', async () => {
      await module.run();

      const actual = await glob(config.toPath('**/*'));

      expect(actual).toInclude(config.toPath('foo.txt'));
    });
  });
});
