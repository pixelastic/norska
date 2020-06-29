module.exports = {
  deploy: {
    // Deploy again if any of those files were changed since the last deploy
    // <root> and <from> are the --root and --from norska options
    // All other paths are relative to the git root
    files: [
      'lambda/**/*',
      'netlify.toml',
      '<from>/**/*',
      '.nvmrc',
      '<root>/norska.config.js',
      '<root>/tailwind.config.js',
    ],
    // If any of those keys in package.json  has been modified since the last
    // deploy, we deploy again
    keys: ['dependencies', 'devDependencies.norska'],
  },
};
