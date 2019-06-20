/* eslint-disable import/no-commonjs, import/no-extraneous-dependencies */
const baseConfig = require('aberlaas/build/configs/jest.js');
const packageJson = require('./package.json');
module.exports = {
  ...baseConfig,
  displayName: packageJson.name,
  watchPathIgnorePatterns: [
    ...baseConfig.watchPathIgnorePatterns,
    `<rootDir>/modules/(?!${packageJson.name})`,
  ],
};
