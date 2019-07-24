import firost from 'firost';
import { _, pMap } from 'golgoth';

// Those modules will be updated to the latest available version
const safelist = ['firost', 'aberlaas', 'golgoth'];

(async function() {
  // Allow specifying which dep to update
  const inputDependencies = _.slice(process.argv, 2);
  const dependenciesToUpdate = _.isEmpty(inputDependencies)
    ? safelist
    : _.intersection(safelist, inputDependencies);

  // Remove and re-add those packages from devDependencies in the root
  const commandRemove = `yarn remove -W ${dependenciesToUpdate.join(' ')}`;
  const commandAdd = `yarn add -W --dev ${dependenciesToUpdate.join(' ')}`;
  console.info('Removing dependencies from root');
  await firost.shell(commandRemove);
  console.info('Re-adding dependencies to root');
  await firost.shell(commandAdd);

  // Find the real versions to use
  const { devDependencies } = await firost.readJson('package.json');
  const versions = _.pick(devDependencies, safelist);
  console.info('Correct versions');
  console.info(versions);

  // Find all the package.json from all modules
  const filepaths = await firost.glob('./modules/*/package.json');

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
  await pMap(filepaths, async filepath => {
    const packageJson = await firost.readJson(filepath);
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

    await firost.writeJson(packageJson, filepath, { sort: false });
  });

  // Finally sync all dependencies to make sure it's correctly hoisted
  console.info('Syncing dependencies');
  await firost.shell('yarn run sync-dependencies');
})();
