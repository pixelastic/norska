const callsites = require('callsites');
const path = require('path');

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
