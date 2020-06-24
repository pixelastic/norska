const consoleInfo = require('firost/lib/consoleInfo');
const consoleError = require('firost/lib/consoleError');
const readJson = require('firost/lib/readJson');
const run = require('firost/lib/run');
const config = require('norska-config');
module.exports = {
  /**
   * Check if the current directory is already linked to a netlify application
   * @returns {boolean} true if already enabled, false otherwise
   **/
  async isEnabled() {
    const netlifyStateFile = config.rootPath('.netlify/state.json');
    const netlifyState = await readJson(netlifyStateFile);
    return !!netlifyState.siteId;
  },
  /**
   * Returns the Netlify token saved in ENV
   * @returns {string} The Netlify token
   **/
  token() {
    return process.env.NETLIFY_AUTH_TOKEN;
  },
  /**
   * Check if a Netfliy token is available
   * @returns {boolean} True if a token is defined
   **/
  hasToken() {
    return !!this.token();
  },
  async enable() {
    // Stop early if no Netlify token
    if (!this.hasToken()) {
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
