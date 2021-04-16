const callsites = require('callsites');
const path = require('path');
const _ = require('golgoth/lodash');
const exists = require('firost/exists');
const copy = require('firost/copy');
const write = require('firost/write');
const mkdirp = require('firost/mkdirp');

/**
 * Helper function to simulate generating the classes of a Tailwind plugin
 * @param {string} relativePluginPath Path to the plugin, relative to the
 * calling file
 * @returns {object} Object of classes
 */
global.tailwindPluginClasses = (relativePluginPath) => {
  // Normalizing paths
  const callingFile = callsites()[1].getFileName();
  const callingDir = path.dirname(callingFile);
  const pluginPath = path.resolve(callingDir, relativePluginPath);
  const pluginDir = path.dirname(pluginPath);
  const plugin = require(pluginPath);

  // Creating mocks
  const addUtilities = jest.fn();
  const theme = jest.fn().mockImplementation((themeName) => {
    const themePath = path.resolve(pluginDir, `themes/${themeName}.js`);
    return require(themePath);
  });

  // Calling the plugin
  plugin.plugin.method()({ addUtilities, theme });
  return addUtilities.mock.calls[0][0];
};

// We do not run tests marked as "slow" by default, unless NORSKA_RUN_SLOW_TESTS
// is set:
// - when running yarn run test:slow
// - when running tests through lint staged

const shouldRunSlowTests = process.env.NORSKA_RUN_SLOW_TESTS;

global.describe.slow = shouldRunSlowTests
  ? global.describe
  : global.describe.skip;
global.it.slow = shouldRunSlowTests ? global.it : global.it.skip;

/**
 * Allow create valid dummy files of various extensions based on https://github.com/mathiasbynens/small
 * @param {string} filepath Where to create the file
 */
global.writeDummyFile = async (filepath) => {
  const extension = _.trim(path.extname(filepath), '.');

  // Only create a folder if a folder path is given
  if (!extension) {
    await mkdirp(filepath);
    return;
  }

  // Create a file based on the fixture we have for this extensions if we have
  // one
  const dummyFilepath = path.resolve(`./fixtures/${extension}.${extension}`);
  if (await exists(dummyFilepath)) {
    await copy(dummyFilepath, filepath);
    return;
  }

  // Otherwise, create an empty text file
  await write('', filepath);
};
