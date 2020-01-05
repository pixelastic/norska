/* eslint-disable import/no-commonjs */
module.exports = {
  extends: ['./node_modules/aberlaas/build/configs/eslint.js'],
  overrides: [
    {
      // Ignore require/import errors in templates
      // These files are on purpose not in the right directory
      files: ['./modules/norska-init/templates/*.js'],
      rules: {
        'import/no-extraneous-dependencies': 0,
        'import/no-unresolved': 0,
      },
    },
  ],
};
