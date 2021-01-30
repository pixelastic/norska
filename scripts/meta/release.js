const run = require('firost/run');
const exit = require('firost/exit');
const prompt = require('firost/prompt');
const gitRoot = require('firost/gitRoot')();
const _ = require('golgoth/lodash');
const consoleInfo = require('firost/consoleInfo');
const consoleSuccess = require('firost/consoleSuccess');
const consoleError = require('firost/consoleError');
const minimist = require('minimist');

const release = {
  setArgs(args) {
    const skipPercy = args.percy === false;
    const version = args._[0];
    this.args = { skipPercy, version };
  },
  async run(args) {
    this.setArgs(args);
    if (await this.isPercyRequired()) {
      consoleInfo('norska-css has been modified since last release');
      await this.waitForPercy();
    }

    await this.runTests();
    await this.release();
  },

  // Check if we need to call Percy
  async isPercyRequired() {
    if (this.args.skipPercy) {
      return false;
    }
    const files = await this.filesChangedSinceLastRelease();
    // We return true whenever the css module has been updated
    return !!_.find(files, (file) => {
      return _.startsWith(file, 'modules/css/');
    });
  },

  // Run a percy test and wait for the result
  async waitForPercy() {
    await this.runPercy();

    consoleInfo('Please, check the link above ⬆️');
    let validation = false;
    while (!validation) {
      const answer = await prompt('Is Percy build ok? [yes/no]');
      if (answer === 'no') {
        consoleError('Percy build failed, exiting');
        exit(1);
      }
      if (answer === 'yes') {
        consoleSuccess('Percy build ok, continuing');
        validation = true;
      }
    }
  },

  // Run the Percy tests
  async runPercy() {
    try {
      consoleInfo('Running Percy tests');
      await this.runFromRoot('yarn run percy');
    } catch (err) {
      consoleError('Percy failed, exiting');
      exit(1);
    }
  },

  // Run unit tests
  async runTests() {
    try {
      consoleInfo('Running tests');
      await this.runFromRoot('yarn run test');
      await this.runFromRoot('yarn run test:slow');
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
