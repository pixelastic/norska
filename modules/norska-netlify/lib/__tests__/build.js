const netlifyConfig = require('../config');
const current = require('../build');
const githubHelper = require('../helper/git');
const netlifyHelper = require('../helper/index');
const norskaHelper = require('norska-helper');
const config = require('norska-config');

describe('norska-netlify > build', () => {
  describe('shouldBuild', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__consoleInfo').mockReturnValue();
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      jest.spyOn(current, '__consoleError').mockReturnValue();
    });
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
      jest
        .spyOn(current, 'importantFilesChanged')
        .mockReturnValue(['src/index.pug']);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(true);
    });
    it('should build if an important key has been modified', async () => {
      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(true);
      jest.spyOn(current, 'getLastDeployCommit').mockReturnValue('abcdef');
      jest.spyOn(current, 'importantFilesChanged').mockReturnValue([]);
      jest.spyOn(current, 'importantKeysChanged').mockReturnValue([{}]);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(true);
    });
    it('should not build if nothing important happened', async () => {
      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(true);
      jest.spyOn(current, 'getLastDeployCommit').mockReturnValue('abcdef');
      jest.spyOn(current, 'importantFilesChanged').mockReturnValue([]);
      jest.spyOn(current, 'importantKeysChanged').mockReturnValue([]);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(false);
    });
  });
  describe('importantFilesChanged', () => {
    it('should find all important files', async () => {
      await config.init({
        root: './docs',
        netlify: netlifyConfig,
      });
      const importantFiles = [
        'docs/norska.config.js',
        'docs/src/assets/deep/file.png',
        'docs/src/index.pug',
        'docs/tailwind.config.js',
        'lambda/index.js',
        'netlify.toml',
      ];
      const notImportantFiles = ['.prettierrc.js', 'README.md', 'scripts/test'];
      const changedFiles = [...importantFiles, ...notImportantFiles];
      jest
        .spyOn(githubHelper, 'filesChangedSinceCommit')
        .mockReturnValue(changedFiles);
      const actual = await current.importantFilesChanged('abcdef');
      expect(actual).toEqual(importantFiles);
    });
  });
  describe('importantKeysChanged', () => {
    it('should return all important keys changed', async () => {
      await config.init({
        netlify: netlifyConfig,
      });
      const packageBefore = {
        version: '1.0',
        dependencies: {
          lodash: '1.0',
        },
        devDependencies: {
          aberlaas: '1.0',
        },
      };
      const packageNow = {
        version: '1.1',
        dependencies: {
          lodash: '1.1',
        },
        devDependencies: {
          aberlaas: '1.1',
        },
      };
      jest
        .spyOn(githubHelper, 'jsonContentAtCommit')
        .mockReturnValue(packageBefore);
      jest.spyOn(current, 'getPackageJson').mockReturnValue(packageNow);
      const actual = await current.importantKeysChanged('abcdef');

      expect(actual).toContainEqual({
        name: 'dependencies',
        before: { lodash: '1.0' },
        after: { lodash: '1.1' },
      });
    });
  });
});
