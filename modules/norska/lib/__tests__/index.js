const module = require('../index');
const helper = require('norska-helper');
const assets = require('norska-assets');
const js = require('norska-js');
const css = require('norska-css');
const html = require('norska-html');
const revv = require('norska-revv');
const config = require('norska-config');
const init = require('norska-init');
const liveServer = require('live-server');
const firost = require('firost');

describe('norska', () => {
  describe('initConfig', () => {
    beforeEach(() => {
      jest.spyOn(assets, 'defaultConfig').mockReturnValue();
      jest.spyOn(css, 'defaultConfig').mockReturnValue();
      jest.spyOn(js, 'defaultConfig').mockReturnValue();
      jest.spyOn(config, 'init').mockReturnValue();
    });
    it('should pass the cliArgs to the config.init script', async () => {
      const input = { _: [], foo: 'bar' };

      await module.initConfig(input);

      expect(config.init).toHaveBeenCalledWith(input, expect.anything());
    });
    it('should pass the assets config', async () => {
      assets.defaultConfig.mockReturnValue({ foo: 'bar' });

      await module.initConfig({});

      expect(config.init).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ assets: { foo: 'bar' } })
      );
    });
    it('should pass the css config', async () => {
      css.defaultConfig.mockReturnValue({ foo: 'bar' });

      await module.initConfig({});

      expect(config.init).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ css: { foo: 'bar' } })
      );
    });
    it('should pass the js config', async () => {
      js.defaultConfig.mockReturnValue({ foo: 'bar' });

      await module.initConfig({});

      expect(config.init).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ js: { foo: 'bar' } })
      );
    });
  });
  describe('init', () => {
    it('should defer to the norska-init module', async () => {
      jest.spyOn(init, 'run').mockReturnValue();

      await module.init();

      expect(init.run).toHaveBeenCalled();
    });
  });
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(firost, 'exit').mockReturnValue();
      jest.spyOn(firost, 'consoleError').mockReturnValue();
      jest.spyOn(module, 'build').mockReturnValue();
      jest.spyOn(module, 'init').mockReturnValue();
      jest.spyOn(module, 'serve').mockReturnValue();
      // jest.spyOn(module, 'screenshot').mockReturnValue();
      jest.spyOn(module, 'initConfig').mockReturnValue();
    });
    it('should allow running the build command', async () => {
      const input = { _: ['build'] };
      jest.spyOn(module, 'build').mockReturnValue();

      await module.run(input);

      expect(module.build).toHaveBeenCalled();
    });
    it('should allow running the init command', async () => {
      const input = { _: ['init'] };

      await module.run(input);

      expect(module.init).toHaveBeenCalled();
    });
    it('should allow running the serve command', async () => {
      const input = { _: ['serve'] };

      await module.run(input);

      expect(module.serve).toHaveBeenCalled();
    });
    it('should run the build command by default', async () => {
      const input = { _: [] };

      await module.run(input);

      expect(module.build).toHaveBeenCalled();
    });
    it('should exit if the command is not allowed', async () => {
      const input = { _: ['nope'] };

      await module.run(input);

      expect(firost.exit).toHaveBeenCalledWith(1);
      expect(firost.consoleError).toHaveBeenCalledWith(
        expect.stringMatching('Unknown command')
      );
    });
    it('should init the config with the passed args', async () => {
      const input = { _: ['build', 'foo', 'bar'], foo: 'bar', bar: 'baz' };

      await module.run(input);

      expect(module.initConfig).toHaveBeenCalledWith({
        _: ['foo', 'bar'],
        foo: 'bar',
        bar: 'baz',
      });
    });
  });
  describe('build', () => {
    const tmpDirectory = './tmp/norska';
    beforeEach(async () => {
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
      });
      await firost.emptyDir(tmpDirectory);
    });
    beforeEach(async () => {
      jest.spyOn(firost, 'exit').mockReturnValue();
      jest.spyOn(firost, 'consoleError').mockReturnValue();
      jest.spyOn(js, 'run').mockReturnValue();
      jest.spyOn(html, 'run').mockReturnValue();
      jest.spyOn(css, 'run').mockReturnValue();
      jest.spyOn(assets, 'run').mockReturnValue();
      jest.spyOn(revv, 'run').mockReturnValue();
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

      await module.build();

      expect(stack).toEqual(['js', 'html', 'css', 'assets', 'revv']);
    });
    it('should create the destination directory', async () => {
      await module.build();

      expect(await firost.exist(config.to())).toEqual(true);
    });
    it('should clear the destination directory in production', async () => {
      await firost.write('foo', config.toPath('something.js'));
      jest.spyOn(helper, 'isProduction').mockReturnValue(true);

      await module.build();

      expect(await firost.exist(config.toPath('something.js'))).toEqual(false);
    });
    it('should exit with error if one of the build command fails', async () => {
      html.run.mockImplementation(() => {
        throw firost.error('ERROR_CODE', 'error message');
      });

      await module.build();

      expect(firost.consoleError).toHaveBeenCalledWith(
        expect.stringContaining('ERROR_CODE')
      );
      expect(firost.consoleError).toHaveBeenCalledWith(
        expect.stringContaining('error message')
      );
      expect(firost.exit).toHaveBeenCalledWith(1);
    });
  });
  describe('serve', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'build').mockReturnValue();
      jest.spyOn(html, 'watch').mockReturnValue();
      jest.spyOn(css, 'watch').mockReturnValue();
      jest.spyOn(js, 'watch').mockReturnValue();
      jest.spyOn(assets, 'watch').mockReturnValue();
      jest.spyOn(liveServer, 'start').mockReturnValue();
      await config.init({
        from: './tmp/norska/src',
        to: './tmp/norska/dist',
        port: 1234,
        assets: assets.defaultConfig(),
      });
    });
    it('should build the website', async () => {
      await module.serve();
      expect(module.build).toHaveBeenCalled();
    });
    it('should watch for changes on html files', async () => {
      await module.serve();
      expect(html.watch).toHaveBeenCalled();
    });
    it('should watch for changes on css files', async () => {
      await module.serve();
      expect(css.watch).toHaveBeenCalled();
    });
    it('should watch for changes on js files', async () => {
      await module.serve();
      expect(js.watch).toHaveBeenCalled();
    });
    it('should start a live server in the dist folder', async () => {
      await module.serve();
      expect(liveServer.start).toHaveBeenCalledWith(
        expect.objectContaining({
          root: config.to(),
          port: 1234,
        })
      );
    });
    it('should build before running the live server', async () => {
      const callStack = [];
      jest.spyOn(module, 'build').mockImplementation(() => {
        callStack.push('build');
      });
      jest.spyOn(liveServer, 'start').mockImplementation(() => {
        callStack.push('serve');
      });

      await module.serve();
      expect(callStack).toEqual(['build', 'serve']);
    });
  });
});