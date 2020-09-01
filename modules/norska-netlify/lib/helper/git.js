const config = require('norska-config');
const gitRoot = require('firost/gitRoot');
const run = require('firost/run');
const _ = require('golgoth/lib/lodash');
const path = require('path');
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
      stderr: false,
      stdout: false,
    });
    return result.stdout;
  },
  /**
   * Returns a list of all files changed since the specific commit
   * @param {string} referenceCommit SHA of the reference commit
   * @returns {Array} Array of absolute filepaths
   **/
  async filesChangedSinceCommit(referenceCommit) {
    const command = `diff --name-only ${referenceCommit} HEAD`;
    const result = await this.runCommand(command);
    const root = this.root();

    return _.chain(result)
      .split('\n')
      .compact()
      .map((filepath) => {
        return path.resolve(root, filepath);
      })
      .value();
  },
  root() {
    return gitRoot(config.root());
  },
  /**
   * Returns the file content of a specific path, at a specific commit
   * @param {string} filepath Path to the file
   * @param {string} commit SHA of the commit
   * @returns {string} Content of the file
   **/
  async jsonContentAtCommit(filepath, commit) {
    try {
      const command = `show ${commit}:${filepath}`;
      const result = await this.runCommand(command);
      return JSON.parse(result);
    } catch (err) {
      return null;
    }
  },
  /**
   * Return the current commit sha
   * @returns {string} Current commit sha
   **/
  async getCurrentCommit() {
    return await this.runCommand('rev-parse HEAD');
  },
};
