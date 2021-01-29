const current = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
const uuid = require('firost/uuid');
const writeJson = require('firost/writeJson');
const path = require('path');

describe('norska-data', () => {
  const tmpDirectory = path.resolve('./tmp/norska-data');
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
    });
    jest
      .spyOn(config, 'theme')
      .mockReturnValue(path.resolve(tmpDirectory, 'theme'));
    await emptyDir(config.root());
    current.__cache = {};
  });
  describe('hasCache', () => {
    it('should return false on first run', async () => {
      const actual = current.hasCache();

      expect(actual).toEqual(false);
    });
    it('should return true if something inside', async () => {
      current.__cache = { foo: 'bar' };

      const actual = current.hasCache();

      expect(actual).toEqual(true);
    });
  });
  describe('getAll', () => {
    it('should return the current cache', async () => {
      current.__cache = { foo: 'bar' };

      const actual = current.getAll();

      expect(actual).toHaveProperty('foo', 'bar');
    });
  });
  describe('warmCache', () => {
    it('should fill the cache on first call', async () => {
      jest.spyOn(current, 'updateCache').mockReturnValue();

      await current.warmCache();

      expect(current.updateCache).toHaveBeenCalled();
    });
    it('should not do anything if cache already set', async () => {
      jest.spyOn(current, 'updateCache').mockReturnValue();
      current.__cache = { foo: 'bar' };

      await current.warmCache();

      expect(current.updateCache).not.toHaveBeenCalled();
    });
  });
  describe('read', () => {
    describe('from json', () => {
      it('should return json content', async () => {
        const input = config.fromPath('_data/foo.json');
        await writeJson({ foo: 'bar' }, input);

        const actual = await current.read(input);

        expect(actual).toHaveProperty('foo', 'bar');
      });
    });
    describe('from javascript', () => {
      // Note:
      // Requiring the same file in different tests always return the first read
      // of the file. Jest seems to be overwriting the default require.cache
      // mechanism, not allowing us to purge the cache between tests.
      // To circumvent this issue, we will actually write files with unique
      // names, preventing any cache to actually occur
      it('as an object', async () => {
        const input = config.fromPath(`_data/${uuid()}.js`);
        await write('module.exports = { foo: "bar" }', input);

        const actual = await current.read(input);

        expect(actual).toHaveProperty('foo', 'bar');
      });
      it('as a string', async () => {
        const input = config.fromPath(`_data/${uuid()}.js`);
        await write('module.exports = "bar"', input);

        const actual = await current.read(input);

        expect(actual).toEqual('bar');
      });
      it('as a number', async () => {
        const input = config.fromPath(`_data/${uuid()}.js`);
        await write('module.exports = 42', input);

        const actual = await current.read(input);

        expect(actual).toEqual(42);
      });
      it('as a function', async () => {
        const input = config.fromPath(`_data/${uuid()}.js`);
        await write('module.exports = function() { return 42 }', input);

        const actual = await current.read(input);

        expect(actual).toEqual(42);
      });
    });
  });
  describe('key', () => {
    it.each([
      ['project', '_data/site.json', 'site'],
      ['project', '_data/projects/firost.json', 'projects.firost'],
      ['project', '_data/projects/2020/firost.json', 'projects.2020.firost'],
      ['project', '_data/site.js', 'site'],
      ['theme', '_data/firost.json', 'firost'],
      ['theme', '_data/projects/firost.json', 'projects.firost'],
      ['theme', '_data/projects/2020/firost.json', 'projects.2020.firost'],
      ['theme', '_data/site.js', 'site'],
    ])('[%s] %s => %s', async (type, input, expected) => {
      const typeHash = {
        project: config.fromPath.bind(config),
        theme: config.themePath.bind(config),
      };

      const actual = current.key(typeHash[type](input));
      expect(actual).toEqual(expected);
    });
  });
  describe('updateCache', () => {
    it('should write data for js and json files in cache', async () => {
      const jsId = uuid();
      const jsonId = uuid();
      await writeJson({ name: 'foo' }, config.fromPath(`_data/${jsonId}.json`));
      await write(
        'module.exports = function() { return { name: "bar" } }',
        config.fromPath(`_data/${jsId}.js`)
      );

      await current.updateCache();
      const actual = current.getAll();

      expect(actual).toHaveProperty(`${jsonId}.name`, 'foo');
      expect(actual).toHaveProperty(`${jsId}.name`, 'bar');
    });
  });
  describe('from a file in the theme', () => {
    it('should read from theme if available', async () => {
      await writeJson({ name: 'docs' }, config.themePath('_data/theme.json'));

      await current.updateCache();
      const actual = current.getAll();

      expect(actual).toHaveProperty('theme.name', 'docs');
    });

    it('should prefer project file if one has the same name', async () => {
      await writeJson({ name: 'docs' }, config.themePath('_data/theme.json'));
      await writeJson({ name: 'project' }, config.fromPath('_data/theme.json'));

      await current.updateCache();
      const actual = current.getAll();

      expect(actual).toHaveProperty('theme.name', 'project');
    });
  });
});
