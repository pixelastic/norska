const config = require('aberlaas/configs/jest.js');
module.exports = {
  ...config,
  setupFilesAfterEnv: [...config.setupFilesAfterEnv, '<rootDir>/jest.setup.js'],
};
