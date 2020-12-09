module.exports = {
  deploy: {
    // Deploy again if any of those files were changed since the last deploy:
    // - All path are relative to the repo root
    // - <projectRoot> is where the package.json holding norska is
    // - <from> is the source folder, relative to the <projectRoot>
    files: [
      'lambda/**/*',
      'netlify.toml',
      '.nvmrc',
      '<projectRoot>/norska.config.js',
      '<projectRoot>/tailwind.config.js',
      '<from>/**/*',
    ],
    // If any of those keys in package.json  has been modified since the last
    // deploy, we deploy again
    keys: ['dependencies', 'scripts.build:prod'],
  },
};
