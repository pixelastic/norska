const _ = require('golgoth/lodash');
const run = require('firost/run');

module.exports = {
  /**
   * Wrapper to get the current process.env.NODE_ENV variable.
   * Wrapping it makes it easier to mock in tests
   * @returns {string} The current NODE_ENV value
   **/
  currentEnvironment() {
    return _.get(process, 'env.NODE_ENV', 'development');
  },
  /**
   * Returns true if currently running in production mode
   * @returns {boolean} True if currently in production, false otherwise
   **/
  isProduction() {
    const keywords = ['prod', 'production'];
    return _.includes(keywords, this.currentEnvironment());
  },
  /**
   * Return the current git commit
   * @returns {string} git SHA
   **/
  async latestGitCommit() {
    if (!this.__latestGitCommit) {
      const { stdout } = await run('git rev-parse --short HEAD', {
        stdout: false,
        stderr: false,
      });
      this.__latestGitCommit = stdout;
    }
    return this.__latestGitCommit;
  },
};
