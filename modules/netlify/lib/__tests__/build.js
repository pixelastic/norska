const netlifyConfig = require('../config');
const current = require('../build');
const netlifyHelper = require('../helper/index');
const norskaHelper = require('norska-helper');
const config = require('norska-config');
const path = require('path');
const Gilmore = require('gilmore');

const { emptyDir, tmpDirectory } = require('firost');
const testDirectory = tmpDirectory('norska/netlify/build');
const repo = new Gilmore(testDirectory);

describe('norska-netlify > build', () => {
  const envSnapshot = { ...process.env };
  beforeEach(async () => {
    jest.spyOn(current, 'gitRoot').mockReturnValue(testDirectory);
    await emptyDir(testDirectory);
    // Set a git user on the CI
    process.env.GIT_USER_NAME = 'Norska';
    process.env.GIT_USER_EMAIL = 'norska@test.com';
  });
  afterEach(() => {
    process.env = envSnapshot;
  });
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
      await config.init({
        root: testDirectory,
        netlify: netlifyConfig,
      });

      await repo.init();
      await repo.writeFile('# norska', 'src/index.pug');
      const initialCommit = await repo.commitAll('initial commit');
      await repo.writeFile('v14.17.0', '.nvmrc');
      await repo.commitAll('update version');

      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(true);
      jest.spyOn(current, 'getLastDeployCommit').mockReturnValue(initialCommit);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(true);
    });
    it('should build if an important key has been modified', async () => {
      await config.init({
        root: testDirectory,
        netlify: netlifyConfig,
      });

      await repo.init();
      await repo.writeFileJson({ version: '0.1' }, 'package.json');
      const initialCommit = await repo.commitAll('initial commit');
      await repo.writeFileJson({ version: '0.2' }, 'package.json');
      await repo.commitAll('update version');

      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(true);
      jest.spyOn(current, 'getLastDeployCommit').mockReturnValue(initialCommit);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(true);
    });
    it('should not build if nothing important happened', async () => {
      await config.init({
        root: testDirectory,
        netlify: netlifyConfig,
      });

      await repo.init();
      await repo.writeFile('# norska', 'README.md');
      const initialCommit = await repo.commitAll('initial commit');
      await repo.writeFileJson({ randomKey: 'something' }, 'package.json');
      await repo.commitAll('update version');

      jest.spyOn(norskaHelper, 'isProduction').mockReturnValue(true);
      jest.spyOn(netlifyHelper, 'isRunningRemotely').mockReturnValue(true);
      jest.spyOn(current, 'getLastDeployCommit').mockReturnValue(initialCommit);
      const actual = await current.shouldBuild();
      expect(actual).toEqual(false);
    });
  });
  describe('importantFilesChanged', () => {
    describe('in a classic setup', () => {
      it('should find all important files', async () => {
        await config.init({
          root: testDirectory,
          netlify: netlifyConfig,
        });
        const changedFiles = [
          {
            name: '.nvmrc',
            status: 'added',
          },
          {
            name: 'lambda/index.js',
            status: 'modified',
          },
          {
            name: 'netlify.toml',
            status: 'deleted',
          },
          {
            name: 'norska.config.js',
            status: 'modified',
          },
          {
            name: 'src/assets/deep/file.png',
            status: 'modified',
          },
          {
            name: 'src/index.pug',
            status: 'modified',
          },
          {
            name: 'tailwind.config.js',
            status: 'modified',
          },
          {
            name: '.prettierrc.js',
            status: 'modified',
          },
          {
            name: 'README.md',
            status: 'modified',
          },
          {
            name: 'scripts/test',
            status: 'modified',
          },
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
        const actual = await current.importantFilesChanged(changedFiles);
        expect(actual).toEqual(expected);
      });
    });
    describe('in a monorepo setup', () => {
      it('should find all important files', async () => {
        await config.init({
          root: path.resolve(testDirectory, 'docs'),
          netlify: netlifyConfig,
        });
        const changedFiles = [
          {
            name: 'README.md',
            status: 'modified',
          },
          {
            name: 'docs/norska.config.js',
            status: 'added',
          },
          {
            name: 'docs/src/assets/deep/file.png',
            status: 'deleted',
          },
          {
            name: 'docs/src/index.pug',
            status: 'modified',
          },
          {
            name: 'docs/tailwind.config.js',
            status: 'modified',
          },
          {
            name: 'lambda/index.js',
            status: 'modified',
          },
          {
            name: 'lib/README.md',
            status: 'modified',
          },
          {
            name: 'lib/main.js',
            status: 'modified',
          },
          {
            name: 'netlify.toml',
            status: 'modified',
          },
          {
            name: 'scripts/test',
            status: 'modified',
          },
          {
            name: '.nvmrc',
            status: 'modified',
          },
          {
            name: '.prettierrc.js',
            status: 'modified',
          },
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
        const actual = await current.importantFilesChanged(changedFiles);
        expect(actual).toEqual(expected);
      });
    });
  });
  describe('importantKeysChanged', () => {
    it.each([
      // title | before | now | expected
      [
        '✔ version changed',
        { version: '1.0' },
        { version: '1.1' },
        [
          {
            before: '1.0',
            after: '1.1',
            name: 'version',
          },
        ],
      ],
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
    ])('%s', async (_title, previousPackage, currentPackage, expected) => {
      await config.init({
        netlify: netlifyConfig,
      });
      const actual = await current.importantKeysChanged(
        previousPackage,
        currentPackage
      );
      expect(actual).toEqual(expected);
    });
  });
});
