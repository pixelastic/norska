import module from '../index';
import helper from 'norska-helper';
import assets from 'norska-assets';
import js from 'norska-js';
import css from 'norska-css';
import config from 'norska-config';
import init from 'norska-init';

describe('norska', () => {
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(helper, 'exit').mockReturnValue();
      jest.spyOn(helper, 'consoleError').mockReturnValue();
      jest.spyOn(module, 'build').mockReturnValue();
      jest.spyOn(module, 'init').mockReturnValue();
      jest.spyOn(module, 'watch').mockReturnValue();
      jest.spyOn(module, 'screenshot').mockReturnValue();
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
    it('should allow running the watch command', async () => {
      const input = { _: ['watch'] };

      await module.run(input);

      expect(module.watch).toHaveBeenCalled();
    });
    it('should allow running the screenshot command', async () => {
      const input = { _: ['screenshot'] };

      await module.run(input);

      expect(module.screenshot).toHaveBeenCalled();
    });
    it('should run the build command by default', async () => {
      const input = { _: [] };

      await module.run(input);

      expect(module.build).toHaveBeenCalled();
    });
    it('should exit if the command is not allowed', async () => {
      const input = { _: ['nope'] };

      await module.run(input);

      expect(helper.exit).toHaveBeenCalledWith(1);
      expect(helper.consoleError).toHaveBeenCalledWith(
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
  describe('initConfig', () => {
    beforeEach(() => {
      jest.spyOn(assets, 'defaultConfig').mockReturnValue();
      jest.spyOn(css, 'defaultConfig').mockReturnValue();
      jest.spyOn(js, 'defaultConfig').mockReturnValue();
      jest.spyOn(config, 'init').mockReturnValue();

      // const modulesConfig = {
      //   assets: assets.defaultConfig(),
      //   css: css.config(),
      //   js: js.defaultConfig(),
      // };
      // await config.init(cliArgs, modulesConfig);
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
});
