const config = require('norska-config');
const gitRoot = require('firost/gitRoot');
const run = require('firost/run');
const _ = require('golgoth/lodash');
const path = require('path');
const chalk = require('golgoth/chalk');
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
  /**
   * Returns a colored overview of the file diff since the reference commit
   * @param {string} referenceCommit SHA of the reference commit
   * @returns {string} Colored diff
   **/
  async diffOverview(referenceCommit) {
    const command = `diff --name-status ${referenceCommit} HEAD`;
    const result = await this.runCommand(command);
    return _.chain(result)
      .split('\n')
      .compact()
      .map((line) => {
        const colors = {
          M: this.colorModified,
          D: this.colorDeleted,
          A: this.colorAdded,
          R: this.colorRenamed,
        };
        const firstLetter = line[0];
        return colors[firstLetter](line);
      })
      .join('\n')
      .replace(/\t/g, '  ')
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
    const relativePath = path.relative(this.root(), config.rootPath(filepath));
    try {
      const command = `show ${commit}:${relativePath}`;
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
};
