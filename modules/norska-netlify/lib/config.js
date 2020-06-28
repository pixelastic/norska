module.exports = {
  deploy: {
    // If any of those files has been modified since the last deploy, we deploy
    // again
    files: [
      'lambda/**/*',
      'netlify.toml',
      'norska.config.js',
      'tailwind.config.js',
      '<from>/**/*',
    ],
    // If any of those keys in package.json  has been modified since the last
    // deploy, we deploy again
    keys: ['dependencies', 'devDependencies.norska'],
  },
};
