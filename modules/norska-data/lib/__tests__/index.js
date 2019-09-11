import module from '../index';
import config from 'norska-config';
import firost from 'firost';

describe('norska-data', () => {
  beforeEach(async () => {
    await config.init({
      from: './tmp/norska-data/src',
      to: './tmp/norska-data/dist',
    });
    await firost.emptyDir('./tmp/norska-data');
  });
  describe('getSourceData', () => {
    const cacheKey = 'norska.data.sourceData';
    beforeEach(() => {
      firost.cache.clear(cacheKey);
    });
    it('should return data for js and json files', async () => {
      await firost.writeJson(
        { name: 'one' },
        config.fromPath('_data/one.json')
      );
      await firost.writeJson(
        { name: 'two' },
        config.fromPath('_data/subdir/two.json')
      );
      await firost.write(
        'export default { name: "three" }',
        config.fromPath('_data/subdir/deep/three.js')
      );

      const actual = await module.getSourceData();

      expect(actual).toHaveProperty('one.name', 'one');
      expect(actual).toHaveProperty('subdir.two.name', 'two');
      expect(actual).toHaveProperty('subdir.deep.three.name', 'three');
    });
    it('should save in cache on first call', async () => {
      await firost.writeJson(
        { name: 'one' },
        config.fromPath('_data/one.json')
      );

      expect(firost.cache.read(cacheKey)).toBeUndefined();
      await module.getSourceData();
      expect(firost.cache.read(cacheKey)).not.toBeUndefined();
    });
    it('should read from cache on subsequent calls', async () => {
      firost.cache.write(cacheKey, 'foo');

      const actual = await module.getSourceData();

      expect(actual).toEqual('foo');
    });
  });
  describe('read', () => {
    describe('from json', () => {
      it('should return json content', async () => {
        const input = config.fromPath('_data/foo.json');
        await firost.writeJson({ foo: 'bar' }, input);

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
      describe('export default', () => {
        it('as an object', async () => {
          const input = config.fromPath(`_data/${firost.uuid()}.js`);
          await firost.write('export default { foo: "bar" }', input);

          const actual = await module.read(input);

          expect(actual).toHaveProperty('foo', 'bar');
        });
        it('as a string', async () => {
          const input = config.fromPath(`_data/${firost.uuid()}.js`);
          await firost.write('export default "bar"', input);

          const actual = await module.read(input);

          expect(actual).toEqual('bar');
        });
        it('as a number', async () => {
          const input = config.fromPath(`_data/${firost.uuid()}.js`);
          await firost.write('export default 42', input);

          const actual = await module.read(input);

          expect(actual).toEqual(42);
        });
      });
      describe('module.exports', () => {
        it('as an object', async () => {
          const input = config.fromPath(`_data/${firost.uuid()}.js`);
          await firost.write('module.exports = { foo: "bar" }', input);

          const actual = await module.read(input);

          expect(actual).toHaveProperty('foo', 'bar');
        });
        it('as a string', async () => {
          const input = config.fromPath(`_data/${firost.uuid()}.js`);
          await firost.write('module.exports = "bar"', input);

          const actual = await module.read(input);

          expect(actual).toEqual('bar');
        });
        it('as a number', async () => {
          const input = config.fromPath(`_data/${firost.uuid()}.js`);
          await firost.write('module.exports = 42', input);

          const actual = await module.read(input);

          expect(actual).toEqual(42);
        });
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
});
