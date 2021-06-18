const readmeCommands = [
  'yarn run readme',
  'git add ./README.md ./modules/lib/README.md',
];
module.exports = {
  '*.css': 'yarn run lint --css --fix',
  '*.yml': 'yarn run lint --yml --fix',
  '*.json': 'yarn run lint --json --fix',
  '*.js': 'yarn run lint --js --fix',
  'modules/docs/src/**/*.md': readmeCommands,
  '.github/README.template.md': readmeCommands,
  'modules/*/lib/**/*.js': 'yarn run test:precommit',
};
