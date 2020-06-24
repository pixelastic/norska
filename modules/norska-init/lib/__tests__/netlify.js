const module = require('../netlify');
const writeJson = require('firost/lib/writeJson');
const emptyDir = require('firost/lib/emptyDir');
const path = require('path');
const config = require('norska-config');

describe('norska-init > netlify', () => {
  beforeEach(async () => {
    jest
      .spyOn(config, 'rootDir')
      .mockReturnValue(path.resolve('./tmp/norska-init/netlify'));
    await emptyDir(config.rootDir());
  });
  describe('isEnabled', () => {
    it('should return true if .netlify/state.json has an id', async () => {
      await writeJson({}, config.rootPath('.netlify/state.json'));
      const actual = await module.isEnabled();
      expect(actual).toEqual(false);
    });
    it('should return false if .netlify/state.json has no id', async () => {
      await writeJson(
        { siteId: 'uuid' },
        config.rootPath('.netlify/state.json')
      );
      const actual = await module.isEnabled();
      expect(actual).toEqual(true);
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'hasToken').mockReturnValue();
      jest.spyOn(module, 'isEnabled').mockReturnValue();
      jest.spyOn(module, '__run').mockReturnValue();
      jest.spyOn(module, '__consoleInfo').mockReturnValue();
      jest.spyOn(module, '__consoleError').mockReturnValue();
    });
    it('should fail early if no token', async () => {
      module.hasToken.mockReturnValue(false);
      const actual = await module.enable();
      expect(actual).toEqual(false);
      expect(module.__consoleError).toHaveBeenCalled();
    });
    it('should stop early if already enabled', async () => {
      module.hasToken.mockReturnValue(true);
      module.isEnabled.mockReturnValue(true);
      const actual = await module.enable();
      expect(actual).toEqual(true);
      expect(module.__consoleInfo).toHaveBeenCalled();
    });
    it('should init the netlify app', async () => {
      module.hasToken.mockReturnValue(true);
      module.isEnabled.mockReturnValue(false);
      await module.enable();
      expect(module.__run).toHaveBeenCalledWith('yarn run netlify init', {
        shell: true,
        stdin: true,
      });
    });
  });
});
