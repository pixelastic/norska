const NetlifyAPI = require('netlify');
const config = require('norska-config');
const exists = require('firost/exists');
const readJson = require('firost/readJson');
const got = require('golgoth/got');
const _ = require('golgoth/lodash');
module.exports = {
  /**
   * Returns the Netlify token saved in ENV
   * @returns {string} The Netlify token
   **/
  token() {
    return this.getEnvVar('NETLIFY_AUTH_TOKEN');
  },
  /**
   * Check if a Netlify token is available
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
    return await this.localSiteId();
  },
  /**
   * Check if the current repo is linked to a remote site
   * @returns {boolean} True if linked
   **/
  async isLinkedLocally() {
    return !!(await this.localSiteId());
  },
  /**
   * Returns the siteId from the local filesystem
   * @returns {string} Netlify siteId
   **/
  async localSiteId() {
    const netlifyStateFile = config.rootPath('.netlify/state.json');
    if (!(await exists(netlifyStateFile))) {
      return false;
    }
    const netlifyState = await readJson(netlifyStateFile);
    return netlifyState.siteId;
  },
  /**
   * Returns the current Netlify site name
   * @returns {string} Site name
   **/
  async siteName() {
    const siteId = await this.siteId();
    const client = this.apiClient();
    const response = await client.getSite({ site_id: siteId });
    return response.name;
  },
  /**
   * Returns an ENV var by name.
   * @param {string} key Name of the var
   * @returns {string} Value of the var
   **/
  getEnvVar(key) {
    return process.env[key];
  },
  /**
   * Make a raw API call to the Netlify API without using their API client
   * because some endpoints are not implemented
   * @param {string} apiPath Path of the api, after the api/v1 part
   * @param {object} userOptions Options to pass to the internal got call
   * @returns {object} Parsed JSON response or raw response
   **/
  async rawApiCall(apiPath, userOptions = {}) {
    const token = this.token();
    const apiUrl = `https://api.netlify.com/api/v1/${apiPath}`;
    const defaultOptions = {
      method: 'get',
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const options = _.merge({}, defaultOptions, userOptions);
    const response = await got(apiUrl, options);
    try {
      return JSON.parse(response.body);
    } catch (err) {
      return response.body;
    }
  },
};
