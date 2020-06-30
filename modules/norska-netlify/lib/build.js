const helper = require('./helper/');
const norskaHelper = require('norska-helper');
const gitHelper = require('./helper/git.js');
const _ = require('golgoth/lib/lodash');
const config = require('norska-config');
const path = require('path');
const multimatch = require('multimatch');
const readJson = require('firost/lib/readJson');
const exit = require('firost/lib/exit');
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
    // Only checks when running in production on Netlify
    const isRunningRemotely = helper.isRunningRemotely();
    const isProduction = norskaHelper.isProduction();
    if (!(isRunningRemotely && isProduction)) {
      return true;
    }

    this.__consoleInfo(
      'Starting building for production on Netlify. Should it continue?'
    );

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

    // Convert  <from> in glob patterns
    const rawGlobs = config.get('netlify.deploy.files');
    const globPatterns = _.map(rawGlobs, (globPattern) => {
      const from = path.relative(config.root(), config.from());
      return _.replace(globPattern, '<from>', from);
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
    return await readJson(config.rootPath('package.json'));
  },
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
};
