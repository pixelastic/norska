const run = require('firost/run');
const exit = require('firost/exit');
const gitRoot = require('firost/gitRoot')();
const _ = require('golgoth/lodash');
const consoleInfo = require('firost/consoleInfo');
const consoleError = require('firost/consoleError');
const minimist = require('minimist');

const release = {
  setArgs(args) {
    const skipTests = args.tests === false;
    const version = args._[0];
    this.args = { skipTests, version };
  },
  async run(args) {
    this.setArgs(args);

    if (!this.args.skipTests) {
      await this.runTests();
    }
    await this.release();
  },

  // Run unit tests
  async runTests() {
    try {
      consoleInfo('Running tests');
      await this.runFromRoot('yarn run test --colors');
      await this.runFromRoot('yarn run test:slow --colors');
    } catch (err) {
      consoleError('Tests failed, exiting');
      exit(1);
    }
  },

  // Release the module(s)
  async release() {
    try {
      consoleInfo('Releasing');
      await this.runFromRoot(`lerna publish --yes ${this.args.version}`);
    } catch (err) {
      consoleError('Tests failed, exiting');
      exit(1);
    }
  },

  // Run a command at the root of the repo
  async runFromRoot(command, options = {}) {
    await run(`cd ${gitRoot} && ${command}`, { shell: true, ...options });
  },

  // Find last release tag
  async lastReleaseTag() {
    const { stdout } = await run('git tag -l --sort=creatordate', {
      stdout: false,
    });
    return _.chain(stdout).split('\n').last().value();
  },
  // Find files changed since last release
  async filesChangedSinceLastRelease() {
    const tag = await this.lastReleaseTag();
    const { stdout } = await run(`git diff --name-only ${tag} HEAD`, {
      stdout: false,
    });
    return _.chain(stdout).split('\n').value();
  },
};

(async () => {
  const args = minimist(process.argv.slice(2), { boolean: true });
  await release.run(args);
})();
