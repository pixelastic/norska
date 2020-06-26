const NetlifyAPI = require('netlify');
const config = require('norska-config');
const exists = require('firost/lib/exists');
const readJson = require('firost/lib/readJson');
module.exports = {
  /**
   * Returns the Netlify token saved in ENV
   * @returns {string} The Netlify token
   **/
  token() {
    return this.getEnvVar('NETLIFY_AUTH_TOKEN');
  },
  /**
   * Check if a Netfliy token is available
   * @returns {boolean} True if a token is defined
   **/
  hasToken() {
    return !!this.token();
  },
  /**
   * Returns a Netlify API Client
   * Always returns the same instance
   * @returns {object} NetlifyAPI instance
   **/
  apiClient() {
    if (!this.__apiClient) {
      const token = this.token();
      this.__apiClient = new NetlifyAPI(token);
    }
    return this.__apiClient;
  },
  /**
   * Check if the current code is running on Netlify servers
   * @returns {boolean} True if running remotely, false otherwise
   **/
  isRunningRemotely() {
    return !!this.getEnvVar('NETLIFY');
  },
  /**
   * Returns the current siteId
   * @returns {string} Netlify Site ID
   **/
  async siteId() {
    if (this.__siteId) {
      return this.__siteId;
    }

    // Remotely: saved as SITE_ID
    if (this.isRunningRemotely()) {
      return this.getEnvVar('SITE_ID');
    }

    // Locally: Saved in .netlify/state.json
    const netlifyStateFile = config.rootPath('.netlify/state.json');
    if (!(await exists(netlifyStateFile))) {
      return false;
    }
    const netlifyState = await readJson(netlifyStateFile);
    return netlifyState.siteId;
  },
  /**
   * Returns an ENV var by name.
   * @param {string} key Name of the var
   * @returns {string} Value of the var
   **/
  getEnvVar(key) {
    return process.env[key];
  },
};
