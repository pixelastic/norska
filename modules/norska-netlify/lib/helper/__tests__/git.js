const current = require('../git');
const config = require('norska-config');
const isCI = process.env.CI;
const write = require('firost/lib/write');
const writeJson = require('firost/lib/writeJson');
const mkdirp = require('firost/lib/mkdirp');
const remove = require('firost/lib/remove');
const emptyDir = require('firost/lib/emptyDir');
const pAll = require('golgoth/lib/pAll');
const path = require('path');
const os = require('os');

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

describe('norska-netlify > git', () => {
  beforeEach(async () => {
    const tmpRepoPath = path.resolve(
      os.tmpdir(),
      'norska/norska-netlify/helpers/git'
    );
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
      expect(actual).toEqual(['four', 'one', 'two']);
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
  });
});
