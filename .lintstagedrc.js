module.exports = {
  '*.css': ['./scripts/meta/lint --css --fix', 'git add'],
  '*.yml': ['./scripts/meta/lint --yml --fix', 'git add'],
  '*.json': ['./scripts/meta/lint --json --fix', 'git add'],
  '*.js': ['./scripts/meta/lint --js --fix', 'git add'],
  'modules/*/lib/**/*.js': './scripts/meta/test --failFast --findRelatedTests',
};