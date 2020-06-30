module.exports = {
  deploy: {
    // Deploy again if any of those files were changed since the last deploy
    // <from> will be replaced with the source directory (defaults to ./src)
    files: [
      'lambda/**/*',
      'netlify.toml',
      'norska.config.js',
      'tailwind.config.js',
      '.nvmrc',
      '<from>/**/*',
    ],
    // If any of those keys in package.json  has been modified since the last
    // deploy, we deploy again
    keys: ['dependencies'],
  },
};
