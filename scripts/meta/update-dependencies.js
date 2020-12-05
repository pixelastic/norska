const _ = require('golgoth/lodash');
const pMap = require('golgoth/pMap');
const run = require('firost/run');
const readJson = require('firost/readJson');
const writeJson = require('firost/writeJson');
const glob = require('firost/glob');

// Those modules will be updated to the latest available version
const safelist = ['firost', 'aberlaas', 'golgoth', 'lerna'];

(async () => {
  // Allow specifying which dep to update
  const inputDependencies = _.slice(process.argv, 2);
  const dependenciesToUpdate = _.isEmpty(inputDependencies)
    ? safelist
    : _.intersection(safelist, inputDependencies);

  // Remove and re-add those packages from devDependencies in the root
  const commandRemove = `yarn remove -W ${dependenciesToUpdate.join(' ')}`;
  const commandAdd = `yarn add -W --dev ${dependenciesToUpdate.join(' ')}`;
  console.info('Removing dependencies from root');
  await run(commandRemove);

  console.info('Re-adding dependencies to root');
  await run(commandAdd);

  // Find the real versions to use
  const { devDependencies } = await readJson('package.json');
  const versions = _.pick(devDependencies, safelist);
  console.info('Correct versions');
  console.info(versions);

  // Find all the package.json from all modules
  const filepaths = await glob('./modules/*/package.json');

  /**
   * Update values of a dependency object with values passed in second argument
   * @param {object} dependencies Dependency object from a package.json
   * @param {object} correctVersions Object of module: version
   * @returns {object} Updated dependency object
   **/
  function updateDependencies(dependencies, correctVersions) {
    return _.mapValues(dependencies, (value, key) => {
      if (correctVersions[key]) {
        return correctVersions[key];
      }
      return value;
    });
  }

  // Update all those package.json with the new versions
  await pMap(filepaths, async (filepath) => {
    const packageJson = await readJson(filepath);
    packageJson.dependencies = updateDependencies(
      packageJson.dependencies,
      versions
    );
    if (packageJson.devDependencies) {
      packageJson.devDependencies = updateDependencies(
        packageJson.devDependencies,
        versions
      );
    }

    await writeJson(packageJson, filepath, {
      sort: false,
    });
  });

  // Re-run yarn install so yarn hoists all dependencies it can
  await run('yarn install');
})();
