import module from '../index';
import { chalk } from 'golgoth';
import config from 'norska-config';
import firost from 'firost';

describe('norska-helper', () => {
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
      module.__siteData = {};
      jest.spyOn(config, 'from').mockReturnValue('./fixtures/src');
    });
    it('returns the content of _data.json in source', async () => {
      const actual = await module.siteData();

      expect(actual).toHaveProperty('foo', 'bar');
    });
    it('emits a warning if the file is not found', async () => {
      jest.spyOn(module, 'consoleWarn').mockReturnValue();
      jest.spyOn(config, 'fromPath').mockReturnValue('/nope');
      const actual = await module.siteData();

      expect(module.consoleWarn).toHaveBeenCalled();
      expect(actual).toEqual({});
    });
    it('reads from cache by default', async () => {
      jest.spyOn(firost, 'readJson');

      await module.siteData();
      await module.siteData();

      expect(firost.readJson).toHaveBeenCalledTimes(1);
    });
    it('force a re-read if cache: false is passed', async () => {
      jest.spyOn(firost, 'readJson');

      await module.siteData();
      await module.siteData({ cache: false });

      expect(firost.readJson).toHaveBeenCalledTimes(2);
    });
  });
});
