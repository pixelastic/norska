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
    await this.setEnvVariables();
  },
  async linkRepository() {
    // Stop if already linked
    const siteId = await helper.siteId();
    if (siteId) {
      this.__consoleInfo('Repository already linked to Netlify');
      return;
    }

    await this.__run('yarn run netlify init', { shell: true, stdin: true });
  },
  async setEnvVariables() {
    // Updating a website config overrides all keys, so we first grab them and
    // re-add them all
    const client = helper.apiClient();
    const siteId = await helper.siteId();
    const siteData = await client.getSite({ site_id: siteId });
    const currentEnvVars = _.get(siteData, 'build_settings.env', {});

    const token = helper.token();
    const envVars = {
      ...currentEnvVars,
      NETLIFY_AUTH_TOKEN: token,
    };
    await client.updateSite({
      site_id: siteId,
      body: {
        build_settings: {
          env: envVars,
        },
      },
    });
    this.__consoleSuccess('NETLIFY_AUTH_TOKEN saved to Netlify');
  },
  __run: run,
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
  __consoleError: consoleError,
};
