/**
 * This config file is used by modules, to run their tests individually. See the
 * "Monorepo quirks" entry in the README to get more context about why this file
 * is needed
 **/
const jestConfig = require('./jest.config.js');
const fs = require('fs');
const path = require('path');

const fullpath = process.env.MODULE_FULL_PATH;
const modulesDirectory = path.dirname(fullpath);
const moduleToTest = path.basename(fullpath);

// Get all modules in ./modules and add them to the ignore list, except for the
// one we want to test
const allModules = fs.readdirSync(modulesDirectory);
let ignorePatterns = [];
allModules.forEach((moduleName) => {
  if (moduleName === moduleToTest) {
    return;
  }
  ignorePatterns.push(`${modulesDirectory}/${moduleName}/`);
});

// Update watch and test ignore patterns
const watchPathIgnorePatterns = jestConfig.watchPathIgnorePatterns.concat(
  ignorePatterns
);
const testPathIgnorePatterns = jestConfig.testPathIgnorePatterns.concat(
  ignorePatterns
);

module.exports = {
  ...jestConfig,
  displayName: moduleToTest,
  watchPathIgnorePatterns,
  testPathIgnorePatterns,
};
