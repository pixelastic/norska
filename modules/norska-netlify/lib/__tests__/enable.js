const current = require('../enable');
const emptyDir = require('firost/emptyDir');
const path = require('path');
const config = require('norska-config');
const helper = require('../helper/index.js');

describe('norska-netlify > enable', () => {
  beforeEach(async () => {
    jest
      .spyOn(config, 'root')
      .mockReturnValue(path.resolve('./tmp/norska-init/netlify'));
    jest.spyOn(current, '__consoleInfo').mockReturnValue();
    jest.spyOn(current, '__consoleError').mockReturnValue();
    jest.spyOn(current, '__consoleSuccess').mockReturnValue();
    jest.spyOn(current, '__run').mockReturnValue();
    await emptyDir(config.root());
  });
  describe('enable', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'hasToken').mockReturnValue();
      jest.spyOn(current, 'linkRepository').mockReturnValue();
      jest.spyOn(current, 'setEnvVariables').mockReturnValue();
    });
    it('should fail early if no token', async () => {
      helper.hasToken.mockReturnValue(false);
      const actual = await current.run();
      expect(actual).toEqual(false);
      expect(current.__consoleError).toHaveBeenCalled();
    });
    it('should link the repository', async () => {
      helper.hasToken.mockReturnValue(true);
      await current.run();
      expect(current.linkRepository).toHaveBeenCalled();
    });
    it('should set the env variables', async () => {
      helper.hasToken.mockReturnValue(true);
      await current.run();
      expect(current.setEnvVariables).toHaveBeenCalled();
    });
  });
  describe('linkRepository', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'isLinkedLocally').mockReturnValue();
    });
    it('should stop early if already a siteId', async () => {
      helper.isLinkedLocally.mockReturnValue(true);
      await current.linkRepository();
      expect(current.__consoleInfo).toHaveBeenCalled();
      expect(current.__run).not.toHaveBeenCalled();
    });
    it('should init the netlify app', async () => {
      helper.isLinkedLocally.mockReturnValue(false);
      await current.linkRepository();
      expect(current.__run).toHaveBeenCalledWith('yarn run netlify init', {
        shell: true,
        stdin: true,
      });
    });
  });
});
