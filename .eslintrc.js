/* eslint-disable import/no-commonjs */
module.exports = {
  extends: ['./node_modules/aberlaas/build/configs/eslint.js'],
  overrides: [
    {
      // Ignore require/import errors in templates
      files: ['./modules/norska-init/templates/*.js'],
      rules: {
        'import/no-extraneous-dependencies': 0,
      },
    },
  ],
};
