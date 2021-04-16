const current = require('../main');
const helper = require('norska-helper');
const assets = require('norska-assets');
const js = require('norska-js');
const css = require('norska-css');
const html = require('norska-html');
const revv = require('norska-revv');
const netlify = require('norska-netlify');
const config = require('norska-config');
const init = require('norska-init');
const serve = require('norska-serve');
const emptyDir = require('firost/emptyDir');
const exist = require('firost/exist');
const write = require('firost/write');
const firostError = require('firost/error');

describe('norska', () => {
  describe('initConfig', () => {
    it('should pass the cliArgs to the config.init script', async () => {
      jest.spyOn(current, '__configInit');
      const input = { _: [], foo: 'bar' };

      await current.initConfig(input);

      expect(current.__configInit).toHaveBeenCalledWith(
        input,
        expect.anything()
      );
    });
    describe('default configs', () => {
      it('assets', async () => {
        await current.initConfig({});
        const actual = config.get(testName);

        expect(actual).toHaveProperty('files');
      });
      it('cms', async () => {
        await current.initConfig({});
        const actual = config.get(testName);

        expect(actual).toHaveProperty('port');
      });
      it('css', async () => {
        await current.initConfig({});
        const actual = config.get(testName);

        expect(actual).toHaveProperty('input');
      });
      it('revv', async () => {
        await current.initConfig({});
        const actual = config.get(testName);

        expect(actual).toHaveProperty('hashingMethod');
      });
      it('js', async () => {
        await current.initConfig({});
        const actual = config.get(testName);

        expect(actual).toHaveProperty('input');
        expect(actual).toHaveProperty('output');
      });
    });
  });
  describe('init', () => {
    it('should defer to the norska-init current', async () => {
      jest.spyOn(init, 'run').mockReturnValue();

      await current.init();

      expect(init.run).toHaveBeenCalled();
    });
  });
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(current, '__exit').mockReturnValue();
      jest.spyOn(current, '__consoleError').mockReturnValue();
      jest.spyOn(current, 'build').mockReturnValue();
      jest.spyOn(current, 'init').mockReturnValue();
      jest.spyOn(current, 'serve').mockReturnValue();
      jest.spyOn(current, 'initConfig').mockReturnValue();
    });
    it('should allow running the build command', async () => {
      const input = { _: ['build'] };
      jest.spyOn(current, 'build').mockReturnValue();

      await current.run(input);

      expect(current.build).toHaveBeenCalled();
    });
    it('should allow running the init command', async () => {
      const input = { _: ['init'] };

      await current.run(input);

      expect(current.init).toHaveBeenCalled();
    });
    it('should allow running the serve command', async () => {
      const input = { _: ['serve'] };

      await current.run(input);

      expect(current.serve).toHaveBeenCalled();
    });
    it('should run the build command by default', async () => {
      const input = { _: [] };

      await current.run(input);

      expect(current.build).toHaveBeenCalled();
    });
    it('should exit if the command is not allowed', async () => {
      const input = { _: ['nope'] };

      await current.run(input);

      expect(current.__exit).toHaveBeenCalledWith(1);
      expect(current.__consoleError).toHaveBeenCalledWith(
        expect.stringMatching('Unknown command')
      );
    });
    it('should init the config with the passed args', async () => {
      const input = { _: ['build', 'foo', 'bar'], foo: 'bar', bar: 'baz' };

      await current.run(input);

      expect(current.initConfig).toHaveBeenCalledWith({
        _: ['foo', 'bar'],
        foo: 'bar',
        bar: 'baz',
      });
    });
  });
  describe('build', () => {
    const tmpDirectory = './tmp/norska/main';
    beforeEach(async () => {
      jest.spyOn(current, '__exit').mockReturnValue();
      jest.spyOn(current, '__consoleError').mockReturnValue();
      jest.spyOn(js, 'run').mockReturnValue();
      jest.spyOn(html, 'run').mockReturnValue();
      jest.spyOn(css, 'run').mockReturnValue();
      jest.spyOn(assets, 'run').mockReturnValue();
      jest.spyOn(revv, 'run').mockReturnValue();
      jest.spyOn(netlify, 'shouldBuild').mockReturnValue(true);
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
      });
      await emptyDir(tmpDirectory);
    });
    it('should run js => html => css => assets => revv', async () => {
      let stack = [];
      jest.spyOn(js, 'run').mockImplementation(() => {
        stack.push('js');
      });
      jest.spyOn(html, 'run').mockImplementation(() => {
        stack.push('html');
      });
      jest.spyOn(css, 'run').mockImplementation(() => {
        stack.push('css');
      });
      jest.spyOn(assets, 'run').mockImplementation(() => {
        stack.push('assets');
      });
      jest.spyOn(revv, 'run').mockImplementation(() => {
        stack.push('revv');
      });

      await current.build();

      expect(stack).toEqual(['assets', 'js', 'html', 'css', 'revv']);
    });
    it('should create the destination directory', async () => {
      await current.build();

      expect(await exist(config.to())).toEqual(true);
    });
    it('should clear the destination directory in production', async () => {
      await write('foo', config.toPath('something.js'));
      jest.spyOn(helper, 'isProduction').mockReturnValue(true);

      await current.build();

      expect(await exist(config.toPath('something.js'))).toEqual(false);
    });
    it('should exit with error if one of the build command fails', async () => {
      html.run.mockImplementation(() => {
        throw firostError('ERROR_CODE', 'error message');
      });

      await current.build();

      expect(current.__consoleError).toHaveBeenCalledWith(
        expect.stringContaining('ERROR_CODE')
      );
      expect(current.__consoleError).toHaveBeenCalledWith(
        expect.stringContaining('error message')
      );
      expect(current.__exit).toHaveBeenCalledWith(1);
    });
  });
  describe('serve', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'build').mockReturnValue();
      jest.spyOn(serve, 'run').mockReturnValue();
    });
    it('should build before running the live server', async () => {
      const callStack = [];
      jest.spyOn(current, 'build').mockImplementation(() => {
        callStack.push('build');
      });
      jest.spyOn(serve, 'run').mockImplementation(() => {
        callStack.push('serve');
      });

      await current.serve();
      expect(callStack).toEqual(['build', 'serve']);
    });
  });
});
