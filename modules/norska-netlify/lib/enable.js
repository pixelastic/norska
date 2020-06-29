const consoleInfo = require('firost/lib/consoleInfo');
const consoleSuccess = require('firost/lib/consoleSuccess');
const consoleError = require('firost/lib/consoleError');
const run = require('firost/lib/run');
const helper = require('./helper/index.js');
const _ = require('golgoth/lib/lodash');
module.exports = {
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

    await this.linkRepository();
    const isLinked = helper.isLinkedLocally();
    if (!isLinked) {
      return false;
    }

    await this.setEnvVariables();
  },
  /**
   * Link the current repository to a Netlify site
   **/
  async linkRepository() {
    if (await helper.isLinkedLocally()) {
      this.__consoleInfo('Repository already linked to Netlify');
      return;
    }

    await this.__run('yarn run netlify init', { shell: true, stdin: true });
  },
  /**
   * Return an auth token to use with this repo.
   * Note that Netlify does not allow token scoped by site, so instead we just
   * create a user token that we will only use for this site. This will at least
   * make it easier to revoke than sharing the same token for all websites
   * @returns {string} Auth token value
   **/
  async scopedToken() {
    const scopedTokenName = await this.scopedTokenName();

    // Checking existing tokens, so we can delete it if already in the list
    const allTokens = await helper.rawApiCall('oauth/applications');
    const existingToken = _.find(allTokens, { name: scopedTokenName });
    if (existingToken) {
      const tokenId = existingToken.client_id;
      await helper.rawApiCall(`oauth/applications/${tokenId}`, {
        method: 'delete',
      });
    }

    // We add a new token to the list
    const newTokenResponse = await helper.rawApiCall(
      'oauth/applications/create_token',
      {
        method: 'post',
        json: {
          name: scopedTokenName,
          administrator_id: null,
        },
      }
    );
    const newToken = _.get(newTokenResponse, 'token.access_token');
    return newToken;
  },
  /**
   * Returns the name of the scoped token
   * @returns {string} Name of the scoped token*
   **/
  async scopedTokenName() {
    const siteName = await helper.siteName();
    return `NETLIFY_AUTH_TOKEN (${siteName})`;
  },
  /**
   * Set the required ENV variables on Netlify
   * NETLIFY_AUTH_TOKEN: Newly generated token to cancel the build
   * NODE_ENV: Set to prod to not install devDependencies
   **/
  async setEnvVariables() {
    const client = helper.apiClient();
    const siteId = await helper.siteId();

    // Get all ENV variables
    const getSiteResponse = await client.getSite({ site_id: siteId });
    const currentVars = _.get(getSiteResponse, 'build_settings.env', {});

    // Merge with new ones
    const scopedToken = await this.scopedToken();
    const newVars = {
      ...currentVars,
      NETLIFY_AUTH_TOKEN: scopedToken,
      NODE_ENV: 'production',
    };

    // Update site vars
    await client.updateSite({
      site_id: siteId,
      body: {
        build_settings: {
          env: newVars,
        },
      },
    });
    this.__consoleSuccess('Environment variables saved to Netlify');
  },
  __run: run,
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
};
