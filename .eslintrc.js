module.exports = {
  extends: ['./node_modules/aberlaas/lib/configs/eslint.js'],
  overrides: [
    {
      files: ['modules/norska-init/templates/**/*.js'],
      // Template files contains code that require norska. It is meant to be
      // used in the host, where norska IS in the dependencies, but will fail
      // linting in dev. So we disable the rule here.
      rules: {
        'node/no-extraneous-require': ['off'],
      },
    },
  ],
};
