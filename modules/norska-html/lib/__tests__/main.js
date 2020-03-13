const module = require('../main');
const config = require('norska-config');
const data = require('norska-data');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const read = require('firost/lib/read');
const exist = require('firost/lib/exist');
const writeJson = require('firost/lib/writeJson');
const glob = require('firost/lib/glob');

describe('norska-html', () => {
  const tmpDirectory = './tmp/norska-html/index';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await emptyDir(tmpDirectory);
  });
  describe('pugFilesPattern', () => {
    it('should find pug file in source', async () => {
      await write('dummy', config.fromPath('index.pug'));
      const actual = await glob(await module.pugFilesPattern());

      expect(actual).toContain(config.fromPath('index.pug'));
    });
    it('should find pug file in sub directory of source', async () => {
      await write('dummy', config.fromPath('subdir/index.pug'));
      const actual = await glob(await module.pugFilesPattern());

      expect(actual).toContain(config.fromPath('subdir/index.pug'));
    });
    it('should not find files in _directories', async () => {
      await write('dummy', config.fromPath('_subdir/index.pug'));
      const actual = await glob(await module.pugFilesPattern());

      expect(actual).not.toContain(config.fromPath('_subdir/index.pug'));
    });
  });
  describe('createPage', () => {
    beforeEach(async () => {
      data.clearCache();
    });
    it('should create a file from a template', async () => {
      const input = config.fromPath('_templates/foo.pug');
      const output = config.toPath('output.html');
      await write('p foo', input);

      await module.createPage(input, output);

      const actual = await read(output);
      expect(actual).toEqual('<p>foo</p>');
    });
    it('should use site data', async () => {
      const input = config.fromPath('_templates/foo.pug');
      const output = config.toPath('output.html');
      const dataPath = config.fromPath('_data/foo.json');
      await write('p=data.foo.bar', input);
      await writeJson({ bar: 'baz' }, dataPath);

      await module.createPage(input, output);

      const actual = await read(output);
      expect(actual).toEqual('<p>baz</p>');
    });
    it('should allow overriding site data', async () => {
      const input = config.fromPath('_templates/foo.pug');
      const output = config.toPath('output.html');
      const dataPath = config.fromPath('_data/foo.json');
      await write('p=data.foo.bar', input);
      await writeJson({ bar: 'baz' }, dataPath);

      await module.createPage(input, output, { foo: { bar: 'quux' } });

      const actual = await read(output);
      expect(actual).toEqual('<p>quux</p>');
    });
  });
  describe('getDestinationPath', () => {
    it('index.pug', async () => {
      const expected = 'index.html';
      const actual = module.getDestinationPath(testName);

      expect(actual).toEqual(expected);
    });
    it('foo.pug', async () => {
      const expected = 'foo/index.html';
      const actual = module.getDestinationPath(testName);

      expect(actual).toEqual(expected);
    });
    it('foo/index.pug', async () => {
      const expected = 'foo/index.html';
      const actual = module.getDestinationPath(testName);

      expect(actual).toEqual(expected);
    });
    it('foo/bar.pug', async () => {
      const expected = 'foo/bar/index.html';
      const actual = module.getDestinationPath(testName);

      expect(actual).toEqual(expected);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest
        .spyOn(module, '__spinner')
        .mockReturnValue({ tick() {}, success() {}, failure() {}, info() {} });
    });
    describe('excluded files', () => {
      it('folder starting with _ should not be processed', async () => {
        await write('p foo', config.fromPath('_foo/index.pug'));

        await module.run();

        const actual = await exist(config.toPath('_foo/index.html'));
        expect(actual).toEqual(false);
      });
    });
    describe('compilation error', () => {
      it('should throw if one of the compilation fails', async () => {
        await write('p foo', config.fromPath('index.pug'));
        await write('p.invalid:syntax foo', config.fromPath('error.pug'));

        let actual = null;
        try {
          await module.run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ERROR_HTML_COMPILATION_FAILED');
      });
    });
  });
});
