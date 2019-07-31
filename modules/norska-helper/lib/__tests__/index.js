import module from '../index';
import { chalk } from 'golgoth';
import config from 'norska-config';
import firost from 'firost';

describe('norska-helper', () => {
  const tmpDirectory = './tmp/norska-helper/';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await firost.emptyDir(tmpDirectory);
  });
  describe('consoleWarn', () => {
    beforeEach(() => {
      jest.spyOn(console, 'info').mockReturnValue();
      jest.spyOn(chalk, 'yellow').mockReturnValue();
    });
    it('should be prefixed with yellow ⚠', () => {
      chalk.yellow.mockReturnValue('yellow ⚠');
      module.consoleWarn('foo');

      expect(console.info).toHaveBeenCalledWith('yellow ⚠', 'foo');
    });
  });
  describe('consoleSuccess', () => {
    beforeEach(() => {
      jest.spyOn(console, 'info').mockReturnValue();
      jest.spyOn(chalk, 'green').mockReturnValue();
    });
    it('should be prefixed with green ✔', () => {
      chalk.green.mockReturnValue('green ✔');
      module.consoleSuccess('foo');

      expect(console.info).toHaveBeenCalledWith('green ✔', 'foo');
    });
  });
  describe('consoleError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'info').mockReturnValue();
      jest.spyOn(chalk, 'red').mockReturnValue();
    });
    it('should be prefixed with red ✘', () => {
      chalk.red.mockReturnValue('red ✘');
      module.consoleError('foo');

      expect(console.info).toHaveBeenCalledWith('red ✘', 'foo');
    });
  });
  describe('isProduction', () => {
    it('should return true if current env is prod', () => {
      jest.spyOn(module, 'currentEnvironment').mockReturnValue('prod');

      const actual = module.isProduction();

      expect(actual).toEqual(true);
    });
    it('should return true if current env is production', () => {
      jest.spyOn(module, 'currentEnvironment').mockReturnValue('production');

      const actual = module.isProduction();

      expect(actual).toEqual(true);
    });
    it('should return false otherwise', () => {
      jest.spyOn(module, 'currentEnvironment').mockReturnValue('dev');

      const actual = module.isProduction();

      expect(actual).toEqual(false);
    });
  });
  describe('siteData', () => {
    beforeEach(() => {
      module.clearSiteData();
    });
    it('returns keys for one .json file in _data', async () => {
      await firost.writeJson({ foo: 'bar' }, config.fromPath('_data/foo.json'));
      const actual = await module.siteData();

      expect(actual).toHaveProperty('foo.foo', 'bar');
    });
    it('returns keys for all .json file in _data', async () => {
      await firost.writeJson({ foo: 'bar' }, config.fromPath('_data/foo.json'));
      await firost.writeJson({ bar: 'baz' }, config.fromPath('_data/bar.json'));
      const actual = await module.siteData();

      expect(actual).toHaveProperty('foo.foo', 'bar');
      expect(actual).toHaveProperty('bar.bar', 'baz');
    });
    it('reads from cache by default', async () => {
      await firost.writeJson({ foo: 'bar' }, config.fromPath('_data/foo.json'));
      jest.spyOn(firost, 'readJson');

      await module.siteData();
      await module.siteData();

      expect(firost.readJson).toHaveBeenCalledTimes(1);
    });
    it('force a re-read if cache: false is passed', async () => {
      await firost.writeJson({ foo: 'bar' }, config.fromPath('_data/foo.json'));
      jest.spyOn(firost, 'readJson');

      await module.siteData();
      await module.siteData({ cache: false });

      expect(firost.readJson).toHaveBeenCalledTimes(2);
    });
  });
  describe('clearSiteData', () => {
    it('should set the internal __siteData empty', async () => {
      await module.siteData();
      await module.clearSiteData();
      expect(module.__siteData).toEqual({});
    });
  });
  describe('require', () => {
    beforeEach(() => {
      jest.spyOn(module, '__require').mockReturnValue();
    });
    it('should require the specified id', () => {
      module.require('foo');

      expect(module.__require).toHaveBeenCalledWith('foo');
    });
    it('should return the required module', () => {
      jest.spyOn(module, '__require').mockReturnValue('foo');
      const actual = module.require('foo');

      expect(actual).toEqual('foo');
    });
    it('should return the default key if there is one', () => {
      jest.spyOn(module, '__require').mockReturnValue({ default: 'foo' });
      const actual = module.require('foo');

      expect(actual).toEqual('foo');
    });
  });
});
