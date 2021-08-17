const current = require('../git');
const config = require('norska-config');
const isCI = process.env.CI;
const write = require('firost/write');
const writeJson = require('firost/writeJson');
const mkdirp = require('firost/mkdirp');
const remove = require('firost/remove');
const move = require('firost/move');
const emptyDir = require('firost/emptyDir');
const tmpDirectory = require('firost/tmpDirectory');
const newFile = require('firost/newFile');
const pAll = require('golgoth/pAll');

const testRepo = async function () {
  await current.runCommand('init');
  if (isCI) {
    await current.runCommand('config user.name Tester');
    await current.runCommand('config user.email tester@norska.com');
  }
  return {
    async commitAll(commitMessage) {
      await current.runCommand('add -A');
      await current.runCommand(`commit -m "${commitMessage}"`);
      return current.runCommand('rev-parse --short HEAD');
    },
  };
};

const tmpRepoPath = tmpDirectory('norska/norska-netlify/helpers/git/');
describe('norska-netlify > git', () => {
  beforeEach(async () => {
    jest.spyOn(config, 'root').mockReturnValue(tmpRepoPath);
    await mkdirp(config.root());
    await emptyDir(config.root());
  });
  describe('filesChangedSinceCommit', () => {
    it('should return all files added, deleted or edited', async () => {
      const repo = await testRepo();
      await pAll([
        () => write('One', config.rootPath('one')),
        () => write('Two', config.rootPath('two')),
        () => write('Three', config.rootPath('three')),
      ]);
      const input = await repo.commitAll('Initial commit');

      await pAll([
        () => write('This is modified', config.rootPath('one')),
        () => remove(config.rootPath('two')),
        () => write('This is added', config.rootPath('four')),
      ]);
      await repo.commitAll('Modifications');

      const actual = await current.filesChangedSinceCommit(input);
      expect(actual).toEqual([
        `${tmpRepoPath}/four`,
        `${tmpRepoPath}/one`,
        `${tmpRepoPath}/two`,
      ]);
    });
    it('should ignore changes reverted along several commits', async () => {
      const repo = await testRepo();
      await pAll([
        () => write('One', config.rootPath('one')),
        () => write('Two', config.rootPath('two')),
      ]);
      const input = await repo.commitAll('Initial commit');

      await pAll([
        () => remove(config.rootPath('one')),
        () => write('Two-Two', config.rootPath('two')),
        () => write('Three', config.rootPath('three')),
      ]);
      await repo.commitAll('Updated');

      await pAll([
        () => write('One', config.rootPath('one')),
        () => write('Two', config.rootPath('two')),
        () => remove(config.rootPath('three')),
      ]);
      await repo.commitAll('Reverted');

      const actual = await current.filesChangedSinceCommit(input);
      expect(actual).toEqual([]);
    });
  });
  describe('jsonContentAtCommit', () => {
    it('should return the content of the file', async () => {
      const repo = await testRepo();
      await writeJson({ key: 'One' }, config.rootPath('myfile.json'));
      const commitRef = await repo.commitAll('Initial commit');

      await writeJson({ key: 'Two' }, config.rootPath('myfile.json'));

      await repo.commitAll('Modifications');

      const actual = await current.jsonContentAtCommit(
        'myfile.json',
        commitRef
      );
      expect(actual).toHaveProperty('key', 'One');
    });
    it('should return null if no such file', async () => {
      const repo = await testRepo();
      await writeJson({ key: 'One' }, config.rootPath('myfile.json'));
      const commitRef = await repo.commitAll('Initial commit');

      await writeJson({ key: 'Two' }, config.rootPath('myfile.json'));

      await repo.commitAll('Modifications');

      const actual = await current.jsonContentAtCommit(
        'not-my-file.json',
        commitRef
      );
      expect(actual).toEqual(null);
    });
    it('should work with absolute paths', async () => {
      const repo = await testRepo();
      await writeJson({ key: 'One' }, config.rootPath('myfile.json'));
      const commitRef = await repo.commitAll('Initial commit');

      await writeJson({ key: 'Two' }, config.rootPath('myfile.json'));

      await repo.commitAll('Modifications');

      const actual = await current.jsonContentAtCommit(
        config.rootPath('myfile.json'),
        commitRef
      );
      expect(actual).toHaveProperty('key', 'One');
    });
  });
  describe('diffOverview', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'colorModified').mockImplementation((input) => {
        return `modified:${input}`;
      });
      jest.spyOn(current, 'colorAdded').mockImplementation((input) => {
        return `added:${input}`;
      });
      jest.spyOn(current, 'colorDeleted').mockImplementation((input) => {
        return `deleted:${input}`;
      });
      jest.spyOn(current, 'colorRenamed').mockImplementation((input) => {
        return `renamed:${input}`;
      });
    });
    it('should display colored output of changed files', async () => {
      const repo = await testRepo();
      await pAll([
        () => write('This will not change', config.rootPath('unchanged')),
        () => write('This will be removed', config.rootPath('removed')),
        () => write('This will be renamed', config.rootPath('renamed')),
        () => write('This will be modified', config.rootPath('modified')),
        () => write('This will be reverted', config.rootPath('reverted')),
      ]);
      const commitReference = await repo.commitAll('Initial commit');

      await pAll([
        () => write('This will be added', config.rootPath('added')),
        () => remove(config.rootPath('removed')),
        () => move(config.rootPath('renamed'), config.rootPath('renamed-bis')),
        () => write('This is modified', config.rootPath('modified')),
        () => write('This is modified', config.rootPath('reverted')),
      ]);
      await repo.commitAll('Modifications');

      await write('This will be reverted', config.rootPath('reverted'));
      await repo.commitAll('Revert modification');

      const actual = await current.diffOverview(commitReference);
      expect(actual).toEqual(dedent`
added:A  added
modified:M  modified
deleted:D  removed
renamed:R100  renamed  renamed-bis`);
    });
  });
  describe('commitExists', () => {
    it('true if in the history', async () => {
      const repo = await testRepo();
      await newFile(config.rootPath('myfile.json'));
      const commitRef = await repo.commitAll('Initial commit');

      const actual = await current.commitExists(commitRef);
      expect(actual).toEqual(true);
    });
    it('false if not in the history', async () => {
      await testRepo();

      const actual = await current.commitExists('bad-commit');
      expect(actual).toEqual(false);
    });
  });
});
