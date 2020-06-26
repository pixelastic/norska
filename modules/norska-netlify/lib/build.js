const helper = require('./helper/');
const gitHelper = require('./helper/git.js');
const _ = require('golgoth/lib/lodash');
module.exports = {
  /**
   * Check if the current build should happen based on the deploy history and
   * changed files
   * @returns {boolean} True if should process the build, false otherwise
   **/
  async shouldBuild() {
    const lastDeployCommit = await this.getLastDeployCommit();

    // Check if some important files have been changed since last deploy
    const hasChangedFiles = await this.hasChangedFilesSinceLastDeploy(
      lastDeployCommit
    );
    if (hasChangedFiles) {
      return true;
    }

    // TODO: Check if some package.json keys have been changed
    return false;
  },
  async cancel() {},
  /**
   * Returns the SHA of commit triggering the last deploy
   * @returns {string} Commit sha
   **/
  async getLastDeployCommit() {
    const client = helper.apiClient();
    const siteId = await helper.siteId();
    const allDeploys = await client.listSiteDeploys({ site_id: siteId });
    const lastDeployCommit = _.chain(allDeploys)
      .find({
        state: 'ready',
        branch: 'master',
      })
      .get('commit_ref')
      .value();
    return lastDeployCommit;
  },
  async hasChangedFilesSinceLastDeploy(lastDeployCommit) {
    const changedFiles = await gitHelper.getChangedFilesSinceCommit(
      lastDeployCommit
    );
    console.info(changedFiles);
    // Get the list of changed files since last deploy
    // Get the list of files to watch
    // If some are identical, return trueb
  },
};
