const helper = require('./helper/');
const norskaHelper = require('norska-helper');
const gitHelper = require('./helper/git.js');
const _ = require('golgoth/lib/lodash');
const config = require('norska-config');
const path = require('path');
const multimatch = require('multimatch');
const readJson = require('firost/lib/readJson');
const exit = require('firost/lib/exit');
const root = require('firost/lib/root');
const consoleInfo = require('firost/lib/consoleInfo');
const consoleSuccess = require('firost/lib/consoleSuccess');
const consoleError = require('firost/lib/consoleError');
module.exports = {
  /**
   * Check if the current build should happen based on the deploy history and
   * changed files
   * @returns {boolean} True if should process the build, false otherwise
   **/
  async shouldBuild() {
    this.__consoleInfo(
      'Starting building for production on Netlify. Should it continue?'
    );
    // Always build in dev
    if (!norskaHelper.isProduction()) {
      this.__consoleSuccess('Not running a production build');
      return true;
    }
    // Always build outside of Netlify servers
    if (!helper.isRunningRemotely()) {
      this.__consoleSuccess('Not running on Netlify servers');
      return true;
    }
    // Build if never build before
    const lastDeployCommit = await this.getLastDeployCommit();
    if (!lastDeployCommit) {
      this.__consoleSuccess('Site has never been deployed before.');
      return true;
    }

    // Build if important files were changed since last build
    const importantFilesChanged = await this.importantFilesChanged(
      lastDeployCommit
    );
    if (!_.isEmpty(importantFilesChanged)) {
      this.__consoleSuccess(
        'Some important files were changed since last commit:'
      );
      _.each(importantFilesChanged, this.__consoleInfo);
      return true;
    }

    // Build if important package.json keys were changed since last build
    const importantKeysChanged = await this.importantKeysChanged(
      lastDeployCommit
    );
    if (!_.isEmpty(importantKeysChanged)) {
      this.__consoleSuccess(
        'Some important keys in package.json were changed since last commit:'
      );
      _.each(importantKeysChanged, (key) => {
        const { name, before, after } = key;
        this.__consoleInfo(`${name} was ${before} and is now ${after}`);
      });
      return true;
    }

    this.__consoleError(
      `No important changes since ${lastDeployCommit}, stopping the build`
    );
    return false;
  },
  async cancel() {
    const client = helper.apiClient();
    const deployId = helper.getEnvVar('DEPLOY_ID');
    this.__consoleError(`Cancelling deploy ${deployId}`);
    const response = await client.cancelSiteDeploy({ deploy_id: deployId });
    console.info(response);
    exit(190);
  },
  /**
   * Returns the SHA of commit triggering the last deploy
   * @returns {string} Commit sha
   **/
  async getLastDeployCommit() {
    return helper.getEnvVar('CACHED_COMMIT_REF');
  },
  /**
   * Returns the list of important files changed
   * @param {string} lastDeployCommit Commit of the last deploy
   * @returns {Array} List of important filepath changed
   **/
  async importantFilesChanged(lastDeployCommit) {
    // Get changed files
    const changedFiles = await gitHelper.filesChangedSinceCommit(
      lastDeployCommit
    );

    // Convert <root> and <from> in glob patterns
    const norskaRoot = config.root();
    const repoRoot = await root(norskaRoot);
    const norskaFrom = config.from();
    const rawGlobs = config.get('netlify.deploy.files');
    const globPatterns = _.map(rawGlobs, (globPattern) => {
      return _.chain(globPattern)
        .replace('<root>', path.relative(repoRoot, norskaRoot))
        .replace('<from>', path.relative(repoRoot, norskaFrom))
        .value();
    });

    return multimatch(changedFiles, globPatterns).sort();
  },
  /**
   * Return all important keys changed
   * @param {string} lastDeployCommit SHA of the last deploy
   * @returns {boolean} True if at least one key has been updated, false
   * otherwise
   **/
  async importantKeysChanged(lastDeployCommit) {
    const packageBefore = await gitHelper.jsonContentAtCommit(
      'package.json',
      lastDeployCommit
    );
    const packageNow = await this.getPackageJson();

    const keys = config.get('netlify.deploy.keys');
    const changedKeys = [];
    _.each(keys, (name) => {
      const before = _.get(packageBefore, name, null);
      const after = _.get(packageNow, name, null);
      if (before !== after) {
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
    const rootPath = await root();
    return await readJson(path.resolve(rootPath, 'package.json'));
  },
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
};
