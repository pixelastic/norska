const config = require('norska-config');
const run = require('firost/lib/run');
const _ = require('golgoth/lib/lodash');
module.exports = {
  /**
   * Run a git command in the repo
   *
   * @param {string} gitCommand Git command to run
   * @returns {string} Command output
   */
  async runCommand(gitCommand) {
    const repoPath = config.rootPath();
    const result = await run(`cd ${repoPath} && git ${gitCommand}`, {
      shell: true,
      stdout: false,
    });
    return result.stdout;
  },
  async filesChangedSinceCommit(referenceCommit) {
    const command = `diff --name-only ${referenceCommit} HEAD`;
    const result = await this.runCommand(command);
    return _.chain(result).split("\n").compact().value();
  }
}
