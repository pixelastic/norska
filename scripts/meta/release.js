const { run, exit, gitRoot, consoleInfo, consoleError } = require('firost');
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
      consoleError('Release failed, exiting');
      exit(1);
    }
  },

  // Run a command at the root of the repo
  async runFromRoot(command, options = {}) {
    const root = await gitRoot();
    await run(`cd ${root} && ${command}`, { shell: true, ...options });
  },
};

(async () => {
  const args = minimist(process.argv.slice(2), { boolean: true });
  await release.run(args);
})();
