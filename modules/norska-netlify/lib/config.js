module.exports = {
  deployOnlyIf: {
    packageJsonKeysChanged: ['dependencies', 'devDependencies.norska'],
    filesChanged: ['<from>/**/*'],
  },
};
