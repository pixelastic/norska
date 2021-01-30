module.exports = {
  '*.css': ['./scripts/meta/lint --css --fix'],
  '*.yml': ['./scripts/meta/lint --yml --fix'],
  '*.json': ['./scripts/meta/lint --json --fix'],
  '*.js': ['./scripts/meta/lint --js --fix'],
  'modules/*/lib/**/*.js':
    'NORSKA_RUN_SLOW_TESTS=1 ./scripts/meta/test --failFast --findRelatedTests',
};
