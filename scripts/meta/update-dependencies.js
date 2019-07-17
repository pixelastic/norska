import firost from 'firost';
import path from 'path';
import { _, pMap } from 'golgoth';

// Those modules will be updated to the latest available version
const safelist = ['firost', 'aberlaas', 'golgoth'];

(async function() {
  // // Remove and re-add those packages from devDependencies in the root
  // const commandRemove = `yarn remove -W --dev ${safelist.join(' ')}`;
  // const commandAdd = `yarn add -W --dev ${safelist.join(' ')}`;
  // console.info("Removing dependencies from root");
  // await firost.shell(commandRemove);
  // console.info("Re-adding dependencies from root");
  // await firost.shell(commandAdd);

  // Find the real versions to use
  const { devDependencies } = await firost.readJson('package.json');
  const versions = _.pick(devDependencies, safelist);
  console.info(versions);

  // Find all the package.json from all modules
  const filepaths = await firost.glob('./modules/*/package.json');

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
    packageJson.dependencies = updateDependencies(packageJson.dependencies, versions);
    if (packageJson.devDependencies) {
      packageJson.devDependencies = updateDependencies(
        packageJson.devDependencies, versions
      );
    }

    console.info(packageJson);
  });
  // const result = await pMap(filepaths, async filepath => {
  //   const moduleName = path.basename(path.dirname(filepath));

  //   const content = await firost.readJson(filepath);
  //   const packagesToUpdate = [];
  //   _.each(_.pick(content.dependencies, safelist), (value, key) => {
  //     packagesToUpdate.push({
  //       isDevDependency: false,
  //       packageName: key,
  //     });
  //   });
  //   _.each(_.pick(content.devDependencies, safelist), (value, key) => {
  //     packagesToUpdate.push({
  //       isDevDependency: true,
  //       packageName: key,
  //     });
  //   });
  //   return {
  //     moduleName,
  //     packagesToUpdate,
  //   };
  // });

  // // Go to each module, delete the dependency and add it again
  // await pMap(result, async item => {
  //   const commands = [`cd ./modules/${item.moduleName}`]
  //   if (item.isDevDependency) {
  //     commands.push['yarn remove --dev ${ packageName
  //   }
  //   await firost.shell(`cd ./modules/${item.moduleName} && yarn remove
  // });

  // console.info(result[3]);
})();

// #!/usr/bin/env sh
// # yarn upgrade --latest does not seem to really work with 0.x version
// # Best way to update firost/golgoth is to:
// # - Loop through each package.json
// # - If they have firost or golgoth in their dependency, they need to update
// # - We build an array of all deps found
// # - We run yarn remove firost && yarn add firost for eahc, adding --save-dev if
// # in devDeps
// set -e
