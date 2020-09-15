const config = require('norska-config');
const read = require('firost/read');
const path = require('path');
const glob = require('firost/glob');
const exists = require('firost/exists');
const pMap = require('golgoth/lib/pMap');
const _ = require('golgoth/lib/lodash');

module.exports = {
  mixins: {},
  /**
   * Read all mixin files and save their source internally for use later
   **/
  async init() {
    this.mixins = {};

    const mixinDir = path.resolve(__dirname);
    const mixinFiles = await glob(`${mixinDir}/*.pug`);
    await pMap(mixinFiles, async (filepath) => {
      this.mixins[filepath] = await read(filepath);
    });

    // Also add user-defined mixins in src/_includes/mixins.pug
    const userMixinsPath = config.fromPath('_includes/mixins.pug');
    if (await exists(userMixinsPath)) {
      this.mixins[userMixinsPath] = await read(userMixinsPath);
    }
  },
  /**
   * Returns the source code of all the mixins
   * @returns {string} Pug string of mixins
   **/
  getSource() {
    return _.chain(this.mixins).values().join('\n\n').value();
  },
};
