import module from '../index';
import config from 'norska-config';
import firost from 'firost';
import helper from 'norska-helper';
import { _ } from 'golgoth';
import pEvent from 'p-event';

describe('norska-js', () => {
  const tmpDirectory = './tmp/norska-js';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
      js: module.defaultConfig(),
    });
    await firost.emptyDir(tmpDirectory);
  });
  describe('loadConfig', () => {
    it('should return false if the entry point does not exist', async () => {
      const actual = await module.loadConfig();

      expect(actual).toEqual(false);
    });
    it('should return the object with correct entry if exists', async () => {
      const input = config.fromPath('script.js');
      await firost.write('foo', input);

      const actual = await module.loadConfig();

      expect(actual).toHaveProperty('entry', input);
    });
    it('should set the output path', async () => {
      await firost.write('foo', config.fromPath('script.js'));

      const actual = await module.loadConfig();

      expect(actual).toHaveProperty('output.path', config.to());
    });
    it('should set the output filename', async () => {
      await firost.write('foo', config.fromPath('script.js'));

      const actual = await module.loadConfig();

      expect(actual).toHaveProperty('output.filename', 'script.js');
    });
    it('should use development config by default', async () => {
      await firost.write('foo', config.fromPath('script.js'));

      const actual = await module.loadConfig();

      expect(actual).toHaveProperty('mode', 'development');
    });
    it('should use production values in production', async () => {
      await firost.write('foo', config.fromPath('script.js'));
      jest.spyOn(helper, 'isProduction').mockReturnValue(true);

      const actual = await module.loadConfig();

      expect(actual).toHaveProperty('mode', 'production');
    });
  });
  describe('getCompiler', () => {
    it('should return false if no config is loaded', async () => {
      jest.spyOn(module, 'loadConfig').mockReturnValue(false);
      const actual = await module.getCompiler();

      expect(actual).toEqual(false);
    });
    it('should return a webpack instance with the specified config', async () => {
      jest.spyOn(module, 'loadConfig').mockReturnValue({ foo: 'bar' });
      jest.spyOn(module, '__webpack').mockReturnValue({ bar: 'baz', run() {} });

      const actual = await module.getCompiler();

      expect(actual).toEqual(expect.objectContaining({ bar: 'baz' }));
      expect(module.__webpack).toHaveBeenCalledWith({ foo: 'bar' });
    });
    it('should promisify and bind the run methods', async () => {
      jest.spyOn(module, 'loadConfig').mockReturnValue({});
      const mockWebpack = {
        foo: 'bar',
        run() {
          return this.foo;
        },
      };
      jest.spyOn(module, '__webpack').mockReturnValue(mockWebpack);
      jest.spyOn(module, '__pify').mockImplementation(input => {
        return input;
      });

      const actual = await module.getCompiler();

      expect(actual.run()).toEqual('bar');
      expect(module.__pify).toHaveBeenCalledWith(mockWebpack.run);
    });
  });
  describe('displayStats', () => {
    it('should display a success message with timing', () => {
      const input = { endTime: 10, startTime: 5 };
      _.set(input, 'compilation.options.output.filename', 'foo.js');
      jest.spyOn(helper, 'consoleSuccess').mockReturnValue();

      module.displayStats(input);

      expect(helper.consoleSuccess).toHaveBeenCalledWith(
        'foo.js compiled in 5ms'
      );
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'displayStats').mockReturnValue();
    });
    describe('in dev', () => {
      it('should do nothing if no input file', async () => {
        const actual = await module.run();

        expect(actual).toEqual(false);
      });
      it('should compile script.js in destination', async () => {
        await firost.write('console.log("ok");', config.fromPath('script.js'));

        await module.run();

        const actual = await firost.isFile(config.toPath('script.js'));
        expect(actual).toEqual(true);
      });
      it('should not create a source map file', async () => {
        await firost.write('console.log("ok");', config.fromPath('script.js'));
        await module.run();

        const actual = await firost.isFile(config.toPath('script.js.map'));
        expect(actual).toEqual(false);
      });
      it('should display timing results', async () => {
        await firost.write('console.log("ok");', config.fromPath('script.js'));
        await module.run();

        expect(module.displayStats).toHaveBeenCalled();
      });
    });
    describe('in production', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      });
      it('should create a source map file', async () => {
        await firost.write('console.log("ok");', config.fromPath('script.js'));
        await module.run();

        const actual = await firost.isFile(config.toPath('script.js.map'));
        expect(actual).toEqual(true);
      });
    });
    describe('with errors', () => {
      it('should display error', async () => {
        await firost.write('b@d code', config.fromPath('script.js'));

        let actual = null;
        try {
          await module.run();
        } catch (err) {
          actual = err;
        }

        expect(actual).toHaveProperty(
          'code',
          'ERROR_WEBPACK_COMPILATION_FAILED'
        );
        expect(actual.toString()).toContain('SyntaxError');
      });
    });
  });
  describe('watch', () => {
    afterEach(() => {
      module.unwatch();
    });
    beforeEach(async () => {
      jest.spyOn(module, 'displayStats').mockReturnValue();
    });
    it('should recompile the input file whenever it is changed', async () => {
      await firost.write('console.log("ok");', config.fromPath('script.js'));
      const pulse = await module.watch();
      await pEvent(pulse, 'build');

      await firost.write('console.log("bar");', config.fromPath('script.js'));
      await pEvent(pulse, 'build');
      const actual = await firost.read(config.toPath('script.js'));
      expect(actual).toContain('console.log("bar")');
    });
    it('should fire an error event when compilation fails', async () => {
      await firost.write('console.log("ok");', config.fromPath('script.js'));
      const pulse = await module.watch();
      await pEvent(pulse, 'build');
    });
  });
});
