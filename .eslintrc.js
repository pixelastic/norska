module.exports = {
  extends: ['./node_modules/aberlaas/lib/configs/eslint.js'],
  globals: {
    tailwindPluginClasses: false,
  },
  overrides: [
    {
      files: [
        'modules/init/templates/**/*.js',
        'modules/theme-default/src/script.js',
      ],
      // Template and theme files contains code that require norska. It is meant
      // to be used in the host, where norska IS in the dependencies, but will
      // fail linting in dev. So we disable the rule here.
      rules: {
        'node/no-extraneous-require': ['off'],
      },
    },
  ],
};
