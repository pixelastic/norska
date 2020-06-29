const current = require('../enable');
const writeJson = require('firost/lib/writeJson');
const emptyDir = require('firost/lib/emptyDir');
const path = require('path');
const config = require('norska-config');
const helper = require('../helper/index.js');

describe('norska-netlify > enable', () => {
  beforeEach(async () => {
    jest
      .spyOn(config, 'root')
      .mockReturnValue(path.resolve('./tmp/norska-init/netlify'));
    await emptyDir(config.root());
  });
  describe('isEnabled', () => {
    it('should return true if .netlify/state.json has an id', async () => {
      await writeJson({}, config.rootPath('.netlify/state.json'));
      const actual = await current.isEnabled();
      expect(actual).toEqual(false);
    });
    it('should return false if .netlify/state.json has no id', async () => {
      await writeJson(
        { siteId: 'uuid' },
        config.rootPath('.netlify/state.json')
      );
      const actual = await current.isEnabled();
      expect(actual).toEqual(true);
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'hasToken').mockReturnValue();
      jest.spyOn(current, 'isEnabled').mockReturnValue();
      jest.spyOn(current, '__run').mockReturnValue();
      jest.spyOn(current, '__consoleInfo').mockReturnValue();
      jest.spyOn(current, '__consoleError').mockReturnValue();
    });
    it('should fail early if no token', async () => {
      helper.hasToken.mockReturnValue(false);
      const actual = await current.run();
      expect(actual).toEqual(false);
      expect(current.__consoleError).toHaveBeenCalled();
    });
    it('should stop early if already enabled', async () => {
      helper.hasToken.mockReturnValue(true);
      current.isEnabled.mockReturnValue(true);
      const actual = await current.run();
      expect(actual).toEqual(true);
      expect(current.__consoleInfo).toHaveBeenCalled();
    });
    it('should init the netlify app', async () => {
      helper.hasToken.mockReturnValue(true);
      current.isEnabled.mockReturnValue(false);
      await current.run();
      expect(current.__run).toHaveBeenCalledWith('yarn run netlify init', {
        shell: true,
        stdin: true,
      });
    });
  });
});
