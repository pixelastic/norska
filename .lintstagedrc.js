module.exports = {
  '*.css': 'yarn run lint --css --fix',
  '*.yml': 'yarn run lint --yml --fix',
  '*.json': 'yarn run lint --json --fix',
  '*.js': 'yarn run lint --js --fix',
  'modules/docs/src/**/*.md,.github/README.template.md': 'yarn run readme',
  'modules/*/lib/**/*.js': 'yarn run test:precommit',
};
