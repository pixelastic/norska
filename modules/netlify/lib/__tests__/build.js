const netlifyConfig = require('../config');
const current = require('../build');
const gitHelper = require('../helper/git');
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
    beforeEach(async () => {
      jest.spyOn(gitHelper, 'root').mockReturnValue('/norska/');
    });
    describe('in a classic setup', () => {
      it('should find all important files', async () => {
        await config.init({
          root: '/norska/',
          netlify: netlifyConfig,
        });
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
    });
    describe('in a monorepo setup', () => {
      it('should find all important files', async () => {
        await config.init({
          root: '/norska/docs',
          netlify: netlifyConfig,
        });
        jest.spyOn(gitHelper, 'root').mockReturnValue('/norska/');
        const changedFiles = [
          '/norska/README.md',
          '/norska/docs/norska.config.js',
          '/norska/docs/src/assets/deep/file.png',
          '/norska/docs/src/index.pug',
          '/norska/docs/tailwind.config.js',
          '/norska/lambda/index.js',
          '/norska/lib/README.md',
          '/norska/lib/main.js',
          '/norska/netlify.toml',
          '/norska/scripts/test',
          '/norska/.nvmrc',
          '/norska/.prettierrc.js',
        ];
        const expected = [
          '.nvmrc',
          'docs/norska.config.js',
          'docs/src/assets/deep/file.png',
          'docs/src/index.pug',
          'docs/tailwind.config.js',
          'lambda/index.js',
          'netlify.toml',
        ];
        jest
          .spyOn(gitHelper, 'filesChangedSinceCommit')
          .mockReturnValue(changedFiles);
        const actual = await current.importantFilesChanged('abcdef');
        expect(actual).toEqual(expected);
      });
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
