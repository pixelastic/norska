const helper = require('./helper/');
const norskaHelper = require('norska-helper');
const { _, chalk } = require('golgoth');
const config = require('norska-config');
const path = require('path');
const multimatch = require('multimatch');
const {
  readJson,
  exit,
  consoleInfo,
  consoleSuccess,
  consoleError,
  gitRoot,
} = require('firost');
const Gilmore = require('gilmore');

module.exports = {
  /**
   * Check if the current build should happen based on the deploy history and
   * changed files
   * @returns {boolean} True if should process the build, false otherwise
   **/
  async shouldBuild() {
    // Only checks when running in production on Netlify
    const isRunningRemotely = helper.isRunningRemotely();
    const isProduction = norskaHelper.isProduction();
    if (!(isRunningRemotely && isProduction)) {
      return true;
    }

    this.__consoleInfo(
      'Starting building for production on Netlify. Should it continue?'
    );

    // Build if never built before
    const lastDeployCommit = await this.getLastDeployCommit();
    if (!lastDeployCommit) {
      this.__consoleSuccess('Site has never been deployed before.');
      return true;
    }

    // Get list of changed files since last deploy
    const repo = new Gilmore(config.root());
    const changedFiles = await repo.changedFiles(lastDeployCommit);

    // Display a diff of changed files
    const diffOverview = this.getDiffOverview(changedFiles);
    this.__consoleInfo(`Files modified since last deploy:\n${diffOverview}`);

    // Build if important files were changed since last build
    const importantFilesChanged = await this.importantFilesChanged(
      changedFiles
    );
    if (!_.isEmpty(importantFilesChanged)) {
      this.__consoleSuccess(
        'Some important files were changed since last commit:'
      );
      _.each(importantFilesChanged, this.__consoleInfo);
      return true;
    }

    // Build if important package.json keys were changed since last build
    const previousPackage = await repo.readFileJson(
      'package.json',
      lastDeployCommit
    );
    const currentPackage = await readJson(config.rootPath('package.json'));
    const importantKeysChanged = await this.importantKeysChanged(
      previousPackage,
      currentPackage
    );
    if (!_.isEmpty(importantKeysChanged)) {
      this.__consoleSuccess(
        'Some important keys in package.json were changed since last commit:'
      );
      _.each(importantKeysChanged, (key) => {
        const { name, before, after } = key;
        const displayBefore = JSON.stringify(before);
        const displayAfter = JSON.stringify(after);
        this.__consoleInfo(
          `${name} was ${displayBefore} and is now ${displayAfter}`
        );
      });
      return true;
    }

    this.__consoleError(
      `No important changes since ${lastDeployCommit}, stopping the build`
    );
    return false;
  },
  /**
   * Cancels the current running build
   **/
  async cancel() {
    const client = helper.apiClient();
    const deployId = helper.getEnvVar('DEPLOY_ID');

    this.__consoleError(`Cancelling deploy ${deployId}`);

    // We call the API to cancel the build and stop it
    await client.cancelSiteDeploy({ deploy_id: deployId });

    exit(0);
  },
  /**
   * Returns the SHA of commit triggering the last deploy
   * @returns {string} Commit sha
   **/
  async getLastDeployCommit() {
    // Get the list of all past deploys
    const client = helper.apiClient();
    const siteId = await helper.siteId();
    const response = await client.listSiteDeploys({ site_id: siteId });

    // Get current commit
    const repo = new Gilmore(config.root());
    const currentCommit = await repo.currentCommit();
    const currentBranch = await repo.currentBranch();

    // Pick the first successful deploy on this branch
    const commit = _.chain(response)
      .reject({ commit_ref: currentCommit })
      .find({ state: 'ready', branch: currentBranch })
      .get('commit_ref')
      .value();

    // Double check the commit is in the history (a force push or a change in
    // the origin repo might make the commit unavailable)
    if (!(await repo.commitExists(commit))) {
      return false;
    }

    return commit;
  },
  /**
   * Returns a colored overview of the changed files
   * @param {Array} changedFiles List of changed files
   * @returns {string} Colored diff
   **/
  getDiffOverview(changedFiles) {
    const colors = {
      modified: this.colorModified,
      deleted: this.colorDeleted,
      added: this.colorAdded,
    };
    return _.chain(changedFiles)
      .map(({ name, status }) => {
        return colors[status](name);
      })
      .join('\n')
      .value();
  },
  /**
   * Returns the list of important files from a list of changed files
   * @param {Array} changedFiles List of changed files
   * @returns {Array} List of filepath of files considered important
   */
  async importantFilesChanged(changedFiles = []) {
    // Find relative paths in the repo
    const root = this.gitRoot();
    const projectRoot = path.relative(root, config.root());
    const from = path.relative(root, config.from());

    // Convert custom prefixes, like <projectRoot> or <from>
    const globPatterns = _.chain(config.get('netlify.deploy.files'))
      .map((pattern) => {
        return _.chain(pattern)
          .replace('<projectRoot>', projectRoot)
          .replace('<from>', from)
          .trimStart('/')
          .value();
      })
      .value();

    // Match against pattern
    return _.chain(changedFiles)
      .map('name')
      .thru((filepaths) => {
        return multimatch(filepaths, globPatterns);
      })
      .sort()
      .value();
  },
  /**
   * Compare two versions of package.json and return the important keys changed
   * @param {object} previousPackage Content of the previous package.json
   * @param {object} currentPackage Content of the current package.json
   * @returns {Array} List of important keys changed
   **/
  async importantKeysChanged(previousPackage = {}, currentPackage = {}) {
    const keys = config.get('netlify.deploy.keys');
    const changedKeys = [];
    _.each(keys, (name) => {
      const before = _.get(previousPackage, name, null);
      const after = _.get(currentPackage, name, null);
      if (!_.isEqual(before, after)) {
        changedKeys.push({ name, before, after });
      }
    });
    return changedKeys;
  },
  /**
   * Return content of the top level package.json
   * @returns {object} Content of the package.json
   **/
  async getPackageJson() {
    return await readJson(config.rootPath('package.json'));
  },
  colorModified(input) {
    return chalk.blue(input);
  },
  colorDeleted(input) {
    return chalk.red(input);
  },
  colorAdded(input) {
    return chalk.green(input);
  },
  colorRenamed(input) {
    return chalk.yellow(input);
  },
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
  gitRoot,
};
