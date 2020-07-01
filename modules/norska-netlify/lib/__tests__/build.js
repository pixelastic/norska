const netlifyConfig = require('../config');
const current = require('../build');
const gitHelper = require('../helper/git');
const netlifyHelper = require('../helper/index');
const norskaHelper = require('norska-helper');
const config = require('norska-config');
const _ = require('golgoth/lib/lodash');

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
        netlify: netlifyConfig,
      });
      jest.spyOn(gitHelper, 'root').mockReturnValue('/norska/');
      const changedFiles = [
        '/norska/.nvmrc',
        '/norska/lambda/index.js',
        '/norska/netlify.toml',
        '/norska/norska.config.js',
        '/norska/src/assets/deep/file.png',
        '/norska/src/index.pug',
        '/norska/tailwind.config.js',
        '/norska/.prettierrc.js',
        '/norska/README.md',
        '/norska/scripts/test',
      ];
      const expected = [
        '.nvmrc',
        'lambda/index.js',
        'netlify.toml',
        'norska.config.js',
        'src/assets/deep/file.png',
        'src/index.pug',
        'tailwind.config.js',
      ];
      jest
        .spyOn(gitHelper, 'filesChangedSinceCommit')
        .mockReturnValue(changedFiles);
      const actual = await current.importantFilesChanged('abcdef');
      expect(actual).toEqual(expected);
    });
    it('in a monorepo context', async () => {
      const customConfig = _.clone(netlifyConfig);
      _.set(customConfig, 'deploy.files', [
        'netlify.toml',
        'modules/library/lib/*.js',
        'modules/docs/src/**/*',
      ]);
      await config.init({
        netlify: customConfig,
      });
      jest.spyOn(gitHelper, 'root').mockReturnValue('/norska/');
      const changedFiles = [
        '/norska/modules/docs/src/index.pug',
        '/norska/modules/library/lib/main.js',
        '/norska/netlify.toml',
        '/norska/.prettierrc.js',
      ];
      const expected = [
        'modules/docs/src/index.pug',
        'modules/library/lib/main.js',
        'netlify.toml',
      ];
      jest
        .spyOn(gitHelper, 'filesChangedSinceCommit')
        .mockReturnValue(changedFiles);
      const actual = await current.importantFilesChanged('abcdef');
      expect(actual).toEqual(expected);
    });
  });
  describe('importantKeysChanged', () => {
    it.each([
      // title | before | now | expected
      ['✘ version changed', { version: '1.0' }, { version: '1.1' }, []],
      [
        '✘ devDependencies changed',
        { devDependencies: { aberlaas: '1.0' } },
        { devDependencies: { aberlaas: '1.1' } },
        [],
      ],
      [
        '✔ dependencies changed',
        { dependencies: { norska: '1.0' } },
        { dependencies: { norska: '1.1' } },
        [
          {
            before: { norska: '1.0' },
            after: { norska: '1.1' },
            name: 'dependencies',
          },
        ],
      ],
      [
        '✗ dependencies unchanged',
        { dependencies: { norska: '1.0' } },
        { dependencies: { norska: '1.0' } },
        [],
      ],
      [
        '✔ scripts.build:prod changed',
        { scripts: { 'build:prod': './scripts/build-prod' } },
        { scripts: { 'build:prod': './scripts/build-prod-new' } },
        [
          {
            before: './scripts/build-prod',
            after: './scripts/build-prod-new',
            name: 'scripts.build:prod',
          },
        ],
      ],
    ])('%s', async (_title, packageBefore, packageNow, expected) => {
      await config.init({
        netlify: netlifyConfig,
      });
      jest
        .spyOn(gitHelper, 'jsonContentAtCommit')
        .mockReturnValue(packageBefore);
      jest.spyOn(current, 'getPackageJson').mockReturnValue(packageNow);
      const actual = await current.importantKeysChanged('abcdef');
      expect(actual).toEqual(expected);
    });
  });
  describe('getLastDeployCommit', () => {
    const mockListSiteDeploys = jest.fn();
    beforeEach(async () => {
      jest
        .spyOn(netlifyHelper, 'apiClient')
        .mockReturnValue({ listSiteDeploys: mockListSiteDeploys });
      jest.spyOn(netlifyHelper, 'siteId').mockReturnValue('site-id');
      jest
        .spyOn(gitHelper, 'getCurrentCommit')
        .mockReturnValue('current-commit');
    });
    it('should return the last deploy on master branch that is not the current one', async () => {
      mockListSiteDeploys.mockReturnValue([
        { state: 'failed', branch: 'master', commit_ref: 'bad' },
        { state: 'ready', branch: 'feat/something', commit_ref: 'bad' },
        { state: 'ready', branch: 'master', commit_ref: 'current-commit' },
        { state: 'ready', branch: 'master', commit_ref: 'good' },
        { state: 'ready', branch: 'master', commit_ref: 'bad' },
      ]);

      const actual = await current.getLastDeployCommit();
      expect(mockListSiteDeploys).toHaveBeenCalledWith({ site_id: 'site-id' });
      expect(actual).toEqual('good');
    });
  });
});
