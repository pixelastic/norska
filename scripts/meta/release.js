const run = require('firost/run');
const exit = require('firost/exit');
const prompt = require('firost/prompt');
const gitRoot = require('firost/gitRoot')();
const _ = require('golgoth/lib/lodash');
const consoleInfo = require('firost/consoleInfo');
const consoleSuccess = require('firost/consoleSuccess');
const consoleError = require('firost/consoleError');

const release = {
  async run(_args) {
    if (await this.isPercyRequired()) {
      consoleInfo('norska-css has been modified since last release');
      consoleInfo('Running Percy tests');
      await this.waitForPercy();
    }

    // await this.runTests();
    // await this.publish(args);
  },

  // Check if we need to call Percy
  async isPercyRequired() {
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
    const command = [
      'yarn run percy snapshot',
      './modules/docs/dist',
      '--snapshot-files "percy/**/index.html"',
    ].join(' ');
    try {
      consoleInfo('Running Percy tests');
      await this.runFromRoot(command);
    } catch (err) {
      consoleError('Percy build failed, exiting');
      exit(1);
    }
  },

  /**
   * Run all the unit tests. Will stop the script if they fail.
   **/
  async runTests() {
    try {
      consoleInfo('Running tests');
      await this.runFromRoot('yarn run test');
    } catch (err) {
      consoleError('Tests failed, exiting');
      exit(1);
    }
  },

  // Release the module(s)
  async release(args) {
    try {
      consoleInfo('Releasing');
      await this.runFromRoot(`lerna publish --yes ${args}`);
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
  // TODO: Need to pass the args, to specify the version type
  await release.run(process.argv.slice(2));
})();
