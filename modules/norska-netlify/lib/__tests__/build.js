const netlifyConfig = require('../config');
const current = require('../build');
const githubHelper = require('../helper/git');
const netlifyHelper = require('../helper/index');
const norskaHelper = require('norska-helper');
const config = require('norska-config');
const emptyDir = require('firost/lib/emptyDir');
const writeJson = require('firost/lib/writeJson');

describe('norska-netlify > build', () => {
  describe('shouldBuild', () => {
    it('should always build if not in production', async () => {
      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(false);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(true);
    });
    it('should always build if not on Netlify', async () => {
      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(false);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(true);
    });
    it('should build if there was no deploy before', async () => {
      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(true);
      jest.spyOn(current, 'getLastDeployCommit').mockReturnValue(null);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(true);
    });
    it('should build if an important file has been changed', async () => {
      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(true);
      jest.spyOn(current, 'getLastDeployCommit').mockReturnValue('abcdef');
      jest.spyOn(current, 'hasImportantFilesChanged').mockReturnValue(true);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(true);
    });
    it('should build if an important key has been modified', async () => {
      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(true);
      jest.spyOn(current, 'getLastDeployCommit').mockReturnValue('abcdef');
      jest.spyOn(current, 'hasImportantFilesChanged').mockReturnValue(false);
      jest.spyOn(current, 'hasImportantKeysChanged').mockReturnValue(true);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(true);
    });
    it('should not build if nothing important happened', async () => {
      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(true);
      jest.spyOn(current, 'getLastDeployCommit').mockReturnValue('abcdef');
      jest.spyOn(current, 'hasImportantFilesChanged').mockReturnValue(false);
      jest.spyOn(current, 'hasImportantKeysChanged').mockReturnValue(false);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(false);
    });
  });
  describe('hasImportantFilesChanged', () => {
    beforeEach(async () => {
      await config.init({
        netlify: netlifyConfig,
      });
    });
    it('should return true if files in ./src changed', async () => {
      jest
        .spyOn(githubHelper, 'filesChangedSinceCommit')
        .mockReturnValue(['src/index.pug']);
      const actual = await current.hasImportantFilesChanged();
      expect(actual).toEqual(true);
    });
    it('should return true if files in ./lambda changed', async () => {
      jest
        .spyOn(githubHelper, 'filesChangedSinceCommit')
        .mockReturnValue(['lambda/index.js']);
      const actual = await current.hasImportantFilesChanged();
      expect(actual).toEqual(true);
    });
    it('should convert <from> to the real source', async () => {
      await config.init({
        from: 'source',
        netlify: netlifyConfig,
      });
      jest
        .spyOn(githubHelper, 'filesChangedSinceCommit')
        .mockReturnValue(['source/index.pug']);
      const actual = await current.hasImportantFilesChanged();
      expect(actual).toEqual(true);
    });
    it('should return false if files outside of ./src changed', async () => {
      jest
        .spyOn(githubHelper, 'filesChangedSinceCommit')
        .mockReturnValue(['eslint.config.js']);
      const actual = await current.hasImportantFilesChanged();
      expect(actual).toEqual(false);
    });
    it('should return true if norska.config.js changed', async () => {
      jest
        .spyOn(githubHelper, 'filesChangedSinceCommit')
        .mockReturnValue(['norska.config.js']);
      const actual = await current.hasImportantFilesChanged();
      expect(actual).toEqual(true);
    });
    it('should return true if netlify.toml changed', async () => {
      jest
        .spyOn(githubHelper, 'filesChangedSinceCommit')
        .mockReturnValue(['netlify.toml']);
      const actual = await current.hasImportantFilesChanged();
      expect(actual).toEqual(true);
    });
    it('should return true if tailwind.config.js changed', async () => {
      jest
        .spyOn(githubHelper, 'filesChangedSinceCommit')
        .mockReturnValue(['tailwind.config.js']);
      const actual = await current.hasImportantFilesChanged();
      expect(actual).toEqual(true);
    });
  });
  describe('hasImportantKeysChanged', () => {
    beforeEach(async () => {
      await config.init({
        root: './tmp/norska-netlify/build',
        netlify: netlifyConfig,
      });
      await emptyDir(config.rootDir());
    });
    it('should return true if dependencies were updated', async () => {
      jest
        .spyOn(githubHelper, 'fileContentAtCommit')
        .mockReturnValue('{ "dependencies": { "lodash": "1" }}');
      await writeJson(
        { dependencies: { lodash: '2' } },
        config.rootPath('package.json')
      );
      const actual = await current.hasImportantKeysChanged();
      expect(actual).toEqual(true);
    });
    it('should return true if norska was updated', async () => {
      jest
        .spyOn(githubHelper, 'fileContentAtCommit')
        .mockReturnValue('{ "devDependencies": { "norska": "1.0.0" }}');
      await writeJson(
        { devDependencies: { norska: '1.0.1' } },
        config.rootPath('package.json')
      );
      const actual = await current.hasImportantKeysChanged();
      expect(actual).toEqual(true);
    });
    it('should return false if other devDependencies are updated', async () => {
      jest
        .spyOn(githubHelper, 'fileContentAtCommit')
        .mockReturnValue('{ "devDependencies": { "aberlaas": "1.0.0" }}');
      await writeJson(
        { devDependencies: { aberlaas: '1.0.1' } },
        config.rootPath('package.json')
      );
      const actual = await current.hasImportantKeysChanged();
      expect(actual).toEqual(false);
    });
    it('should return false if version was updated', async () => {
      jest
        .spyOn(githubHelper, 'fileContentAtCommit')
        .mockReturnValue('{ "version": "1.0.0" }');
      await writeJson({ version: '1.0.1' }, config.rootPath('package.json'));
      const actual = await current.hasImportantKeysChanged();
      expect(actual).toEqual(false);
    });
  });
});
