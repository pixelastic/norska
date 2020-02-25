const module = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const uuid = require('firost/lib/uuid');
const writeJson = require('firost/lib/writeJson');

describe('norska-data', () => {
  beforeEach(async () => {
    await config.init({
      from: './tmp/norska-data/src',
      to: './tmp/norska-data/dist',
    });
    await emptyDir('./tmp/norska-data');
    module.__cache = {};
  });
  describe('hasCache', () => {
    it('should return false on first run', async () => {
      const actual = module.hasCache();

      expect(actual).toEqual(false);
    });
    it('should return true if something inside', async () => {
      module.__cache = { foo: 'bar' };

      const actual = module.hasCache();

      expect(actual).toEqual(true);
    });
  });
  describe('getAll', () => {
    it('should return the current cache', async () => {
      module.__cache = { foo: 'bar' };

      const actual = module.getAll();

      expect(actual).toHaveProperty('foo', 'bar');
    });
  });
  describe('init', () => {
    it('should fill the cache on first call', async () => {
      jest.spyOn(module, 'updateCache').mockReturnValue();

      await module.init();

      expect(module.updateCache).toHaveBeenCalled();
    });
    it('should not do anything if cache already set', async () => {
      jest.spyOn(module, 'updateCache').mockReturnValue();
      module.__cache = { foo: 'bar' };

      await module.init();

      expect(module.updateCache).not.toHaveBeenCalled();
    });
  });
  describe('read', () => {
    describe('from json', () => {
      it('should return json content', async () => {
        const input = config.fromPath('_data/foo.json');
        await writeJson({ foo: 'bar' }, input);

        const actual = await module.read(input);

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

        const actual = await module.read(input);

        expect(actual).toHaveProperty('foo', 'bar');
      });
      it('as a string', async () => {
        const input = config.fromPath(`_data/${uuid()}.js`);
        await write('module.exports = "bar"', input);

        const actual = await module.read(input);

        expect(actual).toEqual('bar');
      });
      it('as a number', async () => {
        const input = config.fromPath(`_data/${uuid()}.js`);
        await write('module.exports = 42', input);

        const actual = await module.read(input);

        expect(actual).toEqual(42);
      });
      it('as a function', async () => {
        const input = config.fromPath(`_data/${uuid()}.js`);
        await write('module.exports = function() { return 42 }', input);

        const actual = await module.read(input);

        expect(actual).toEqual(42);
      });
    });
  });
  describe('key', () => {
    it('foo.json', () => {
      const input = config.fromPath('_data/foo.json');

      const actual = module.key(input);

      expect(actual).toEqual('foo');
    });
    it('subdir/foo.json', () => {
      const input = config.fromPath('_data/subdir/foo.json');

      const actual = module.key(input);

      expect(actual).toEqual('subdir.foo');
    });
    it('subdir/deep/foo.json', () => {
      const input = config.fromPath('_data/subdir/deep/foo.json');

      const actual = module.key(input);

      expect(actual).toEqual('subdir.deep.foo');
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

      await module.updateCache();
      const actual = module.getAll();

      expect(actual).toHaveProperty(`${jsonId}.name`, 'foo');
      expect(actual).toHaveProperty(`${jsId}.name`, 'bar');
    });
  });
});
