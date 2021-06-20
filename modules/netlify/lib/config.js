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
    // Deploy again if any of these keys in the project package.json were
    // changed since the last deploy
    keys: ['version', 'dependencies'],
  },
};
