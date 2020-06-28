const helper = require('./helper/');
const norskaHelper = require('norska-helper');
const gitHelper = require('./helper/git.js');
const _ = require('golgoth/lib/lodash');
const config = require('norska-config');
const path = require('path');
const multimatch = require('multimatch');
const readJson = require('firost/lib/readJson');
const exit = require('firost/lib/exit');
module.exports = {
  /**
   * Check if the current build should happen based on the deploy history and
   * changed files
   * @returns {boolean} True if should process the build, false otherwise
   **/
  async shouldBuild() {
    // Always build in dev
    if (!norskaHelper.isProduction()) {
      return true;
    }
    // Always build outside of Netlify servers
    if (!helper.isRunningRemotely()) {
      return true;
    }
    // Build if never build before
    const lastDeployCommit = await this.getLastDeployCommit();
    if (!lastDeployCommit) {
      return true;
    }

    // Build if important files were changed since last build
    if (await this.hasImportantFilesChanged(lastDeployCommit)) {
      return true;
    }

    // Build if important package.json keys were changed since last build
    if (await this.hasImportantKeysChanged(lastDeployCommit)) {
      return true;
    }

    return false;
  },
  async cancel() {
    const client = helper.apiClient();
    const deployId = helper.getEnvVar('DEPLOY_ID');
    console.info(`Cancelling deploy ${deployId}`);
    const response = await client.cancelSiteDeploy({ deploy_id: deployId });
    console.info(response);
    exit(1);
  },
  /**
   * Returns the SHA of commit triggering the last deploy
   * @returns {string} Commit sha
   **/
  async getLastDeployCommit() {
    return helper.getEnvVar('CACHED_COMMIT_REF');
    // // TODO: Seems like the CACHED_COMMIT_REF contains this information
    // // https://docs.netlify.com/configure-builds/environment-variables/#git-metadata
    // const client = helper.apiClient();
    // const siteId = await helper.siteId();
    // const allDeploys = await client.listSiteDeploys({ site_id: siteId });
    // const lastDeployCommit = _.chain(allDeploys)
    //   .find({
    //     state: 'ready',
    //     branch: 'master',
    //   })
    //   .get('commit_ref', null)
    //   .value();
    // return lastDeployCommit;
  },
  /**
   * Check if any of the changed files since the last deploy would require
   * a redeploy
   * @param {string} lastDeployCommit Commit of the last deploy
   * @returns {boolean} True if should redeploy, false otherwise
   **/
  async hasImportantFilesChanged(lastDeployCommit) {
    // Get changed files
    const changedFiles = await gitHelper.filesChangedSinceCommit(
      lastDeployCommit
    );

    // Get glob patterns
    const fromShortForm = path.relative(config.get('root'), config.get('from'));
    const rawGlobs = config.get('netlify.deploy.files');
    const globPatterns = _.map(rawGlobs, (globPattern) => {
      return _.replace(globPattern, '<from>', fromShortForm);
    });

    const result = multimatch(changedFiles, globPatterns);
    return !_.isEmpty(result);
  },
  /**
   * Check if any important key in package.json has been modified since the last
   * deploy
   * @param {string} lastDeployCommit SHA of the last deploy
   * @returns {boolean} True if at least one key has been updated, false
   * otherwise
   **/
  async hasImportantKeysChanged(lastDeployCommit) {
    const packageBefore = JSON.parse(
      await gitHelper.fileContentAtCommit('package.json', lastDeployCommit)
    );
    const packageNow = await readJson(config.rootPath('package.json'));

    const keys = config.get('netlify.deploy.keys');
    let keyChanged = false;
    _.each(keys, (key) => {
      const keyBefore = _.get(packageBefore, key, null);
      const keyAfter = _.get(packageNow, key, null);
      if (keyBefore !== keyAfter) {
        keyChanged = true;
      }
    });
    return keyChanged;
  },
};
