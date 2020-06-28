const consoleInfo = require('firost/lib/consoleInfo');
const consoleError = require('firost/lib/consoleError');
const run = require('firost/lib/run');
const helper = require('./helper/index.js');
module.exports = {
  /**
   * Check if the current directory is already linked to a netlify application
   * @returns {boolean} true if already enabled, false otherwise
   **/
  async isEnabled() {
    const siteId = await helper.siteId();
    return !!siteId;
  },
  /**
   * Enable Netlify on the current repo
   * Expected to be called by norska init
   * @returns {boolean} True if enabled, false otherwise
   **/
  async run() {
    // Stop early if no Netlify token
    if (!helper.hasToken()) {
      this.__consoleError(
        '[netlify]: No NETLIFY_AUTH_TOKEN found, please visit https://app.netlify.com/start/repos to enable manually.'
      );
      return false;
    }

    // Stop if already enabled
    if (await this.isEnabled()) {
      this.__consoleInfo('Netlify already enabled');
      return true;
    }

    await this.__run('yarn run netlify init', { shell: true, stdin: true });
  },
  __run: run,
  __consoleInfo: consoleInfo,
  __consoleError: consoleError,
};
