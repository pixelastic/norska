const current = require('../main');
const pProps = require('golgoth/lib/pProps');
const _ = require('golgoth/lib/lodash');
const uuid = require('firost/lib/uuid');
const config = require('norska-config');
const netlify = require('norska-netlify');
const helper = require('norska-helper');
const consoleInfo = require('firost/lib/consoleInfo');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const writeJson = require('firost/lib/writeJson');
const read = require('firost/lib/read');

// Image output greatly differ based on several aspects:
// - Is the image local or remote (local images must be revved)
// - Are we in dev or in prod (less work to do in dev)
// - Where is the final generated file (relative paths should work)
//
// In order to write comprehensive tests for all those cases, we're configuring
// a list of test cases, with input and expected result. We then build two
// websites (dev and prod), and compare the output with the expected results
//
// We are using it.each to test a bunch of cases. This expect an array of
// arrays. We build this using arrays containing the test name and a unique id
// as parameters. This allow to init the right number of test, with the right
// names
// Before running tests for the first time, we build a dev and prod site with
// all inputs generated and we extract the results into an object.
// When the test is run, we use the id of the test to find the test result and
// compare the actual with the expected
const testCasesImageProxy = [
  // Should ignore local files in dev
  // Should convert local files to remote in prod
  // Should pass all remote files through our bucket
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src!=imageProxy("foo.png"))',
    expected: '<img src="foo.png"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src!=imageProxy("foo.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.png&af&il"/>',
  },
  // Referencing a local image from a subfolder
  {
    env: 'dev',
    destination: 'subfolder/index.pug',
    input: 'img(src!=imageProxy("subimage.png"))',
    expected: '<img src="../subimage.png"/>',
  },
  {
    env: 'prod',
    destination: 'subfolder/index.pug',
    input: 'img(src!=imageProxy("subimage.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Fsubimage.png&af&il"/>',
  },
  // Referencing an explicitly local image in a subfolder
  {
    env: 'dev',
    destination: 'subfolder/index.pug',
    input: 'img(src!=imageProxy("./subimage.png"))',
    expected: '<img src="./subimage.png"/>',
  },
  {
    env: 'prod',
    destination: 'subfolder/index.pug',
    input: 'img(src!=imageProxy("./subimage.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Fsubfolder%2Fsubimage.png&af&il"/>',
  },
  // Referencing an external image
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src!=imageProxy("http://there.com/foo.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Ffoo.png&af&il"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src!=imageProxy("http://there.com/foo.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Ffoo.png&af&il"/>',
  },
  // Passing custom proxy attributes
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src!=imageProxy("http://there.com/foo.png", { width: 100 }))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Ffoo.png&af&il&w=100"/>',
  },
  // Should ignore urls that are already proxyfied
  {
    env: 'prod',
    destination: 'index.pug',
    input:
      'img(src!=imageProxy("https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Ffoo.png&af&il&w=100", { width: 300 }))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Ffoo.png&af&il&w=100"/>',
  },
];
const testCasesRevv = [
  // Revv
  // Should ignore files in dev
  // Should revv files in prod
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src!=revv("foo.png"))',
    expected: '<img src="foo.png"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src!=revv("foo.png"))',
    expected: '<img src="foo.h4sh.png"/>',
  },
  // Normal paths in subfolders
  {
    env: 'dev',
    destination: 'subfolder/index.pug',
    input: 'img(src!=revv("subimage.png"))',
    expected: '<img src="../subimage.png"/>',
  },
  {
    env: 'prod',
    destination: 'subfolder/index.pug',
    input: 'img(src!=revv("foo.png"))',
    expected: '<img src="../foo.h4sh.png"/>',
  },
  // Relative paths in subfolders
  {
    env: 'dev',
    destination: 'subfolder/index.pug',
    input: 'img(src!=revv("./subimage.png"))',
    expected: '<img src="./subimage.png"/>',
  },
  {
    env: 'prod',
    destination: 'subfolder/index.pug',
    input: 'img(src!=revv("./subimage.png"))',
    expected: '<img src="subimage.h4sh.png"/>',
  },
];
const testCasesImgMethod = [
  // Img
  // Should ignore local files in dev
  // Should revv and pass through image proxy local files in prod
  // Should pass through image proxy remote files
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src!=img("foo.png"))',
    expected: '<img src="foo.png"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src!=img("foo.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.h4sh.png&af&il"/>',
  },
  // Referencing a top level image in a subfolder page
  {
    env: 'dev',
    destination: 'foo/index.pug',
    input: 'img(src!=img("foo.png"))',
    expected: '<img src="../foo.png"/>',
  },
  {
    env: 'prod',
    destination: 'foo/index.pug',
    input: 'img(src!=img("foo.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.h4sh.png&af&il"/>',
  },
  // Referencing a subfolder image in a subfolder page
  {
    env: 'dev',
    destination: 'subfolder/index.pug',
    input: 'img(src!=img("./subimage.png"))',
    expected: '<img src="./subimage.png"/>',
  },
  {
    env: 'prod',
    destination: 'subfolder/index.pug',
    input: 'img(src!=img("./subimage.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Fsubfolder%2Fsubimage.h4sh.png&af&il"/>',
  },
  // Referencing an external image
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src!=img("http://there.com/foo.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Ffoo.png&af&il"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src!=img("http://there.com/foo.png"))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Ffoo.png&af&il"/>',
  },
  // Passing custom proxy attributes
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src!=img("http://there.com/foo.png", { width: 100 }))',
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Ffoo.png&af&il&w=100"/>',
  },
];
const testCasesLazyload = [
  // Lazyloading
  // Local images in dev are loading directly
  {
    env: 'dev',
    destination: 'index.pug',
    input: `- const attrs_{testId} = lazyload("foo.png")
    img(src!=attrs_{testId}.placeholder, data-src!=attrs_{testId}.full)`,
    expected: '<img src="foo.png" data-src="foo.png"/>',
  },
  // When disabled, it directly loads the image
  {
    env: 'dev',
    destination: 'index.pug',
    input: `- const attrs_{testId} = lazyload("foo.png", { disable: true })
    img(src!=attrs_{testId}.placeholder, data-src!=attrs_{testId}.full)`,
    expected: '<img src="foo.png" data-src="foo.png"/>',
  },
  // Local images in prod should be proxyfied, as does the placeholder
  {
    env: 'prod',
    destination: 'index.pug',
    input: `- const attrs_{testId} = lazyload("foo.png")
    img(src!=attrs_{testId}.placeholder, data-src!=attrs_{testId}.full)`,
    expected:
      '<img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.h4sh.png&af&blur=5&il&q=50" data-src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.h4sh.png&af&il"/>',
  },
  // Remote images in dev should be proxyfied
  {
    env: 'dev',
    destination: 'index.pug',
    input: `- const attrs_{testId} = lazyload("https://there.com/foo.png")
    img(src!=attrs_{testId}.placeholder, data-src!=attrs_{testId}.full)`,
    expected:
      '<img src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=50" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il"/>',
  },
  // Remote images in prod should by proxyfied as well for the placeholder
  {
    env: 'prod',
    destination: 'index.pug',
    input: `- const attrs_{testId} = lazyload("https://there.com/foo.png")
    img(src!=attrs_{testId}.placeholder, data-src!=attrs_{testId}.full)`,
    expected:
      '<img src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=50" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il"/>',
  },
  // Disabled lazyloading in prod should use the proxyfied url direcly as
  // a placeholder
  {
    env: 'prod',
    destination: 'index.pug',
    input: `- const attrs_{testId} = lazyload("https://there.com/foo.png", { disable: true })
    img(src!=attrs_{testId}.placeholder, data-src!=attrs_{testId}.full)`,
    expected:
      '<img src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il"/>',
  },
  // Passing custom proxy attributes to the image
  {
    env: 'prod',
    destination: 'index.pug',
    input: `- const attrs_{testId} = lazyload("https://there.com/foo.png", { width: 100 })
    img(src!=attrs_{testId}.placeholder, data-src!=attrs_{testId}.full)`,
    expected:
      '<img src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=50&w=100" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il&w=100"/>',
  },
  // Passing custom proxy attributes to the placeholder
  {
    env: 'prod',
    destination: 'index.pug',
    input: `- const attrs_{testId} = lazyload("https://there.com/foo.png", { placeholder: { width: 100 } })
    img(src!=attrs_{testId}.placeholder, data-src!=attrs_{testId}.full)`,
    expected:
      '<img src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=50&w=100" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il"/>',
  },
];
const testCasesImgMixin = [
  {
    env: 'dev',
    destination: 'index.pug',
    input: '+img(src="https://there.com/foo.png")',
    expected:
      '<img class="lazyload" src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=50" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il" loading="lazy"/>',
  },
  // local images should be revved in both placeholder and full
  {
    env: 'prod',
    destination: 'bar/index.pug',
    input: '+img(src="foo.png")',
    expected:
      '<img class="lazyload" src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.h4sh.png&af&blur=5&il&q=50" data-src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.h4sh.png&af&il" loading="lazy"/>',
  },
];
const testCasesScreenshot = [
  // Use current page as default
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src!=screenshot())',
    expected:
      '<img src="https://images.weserv.nl?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26norskaGitCommit%3Dabcdef%26screenshot%3Dtrue%26url%3Dhttp%253A%252F%252Fhere.com&af&il&w=800"/>',
  },
  // Works in subfolders
  {
    env: 'prod',
    destination: 'subfolder/index.pug',
    input: 'img(src!=screenshot())',
    expected:
      '<img src="https://images.weserv.nl?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26norskaGitCommit%3Dabcdef%26screenshot%3Dtrue%26url%3Dhttp%253A%252F%252Fhere.com%252Fsubfolder&af&il&w=800"/>',
  },
  // Allow passing custom url
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src!=screenshot("https://there.com/"))',
    expected:
      '<img src="https://images.weserv.nl?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26norskaGitCommit%3Dabcdef%26screenshot%3Dtrue%26url%3Dhttps%253A%252F%252Fthere.com&af&il&w=800"/>',
  },
];
const testCasesMarkdown = [
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'div!=markdown("![title](https://there.com/foo.png)")',
    expected:
      '<div><p><img src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&amp;af&amp;blur=5&amp;il&amp;q=50" alt="title" class="lazyload" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&amp;af&amp;il" loading="lazy"></p></div>',
  },
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'div!=markdown("![title](foo.png)")',
    expected:
      '<div><p><img src="./foo.png" alt="title" class="lazyload" data-src="./foo.png" loading="lazy"></p></div>',
  },
  {
    env: 'dev',
    destination: 'index.pug',
    input:
      'div!=markdown("![title](subimage.png)", { basePath: "./subfolder" })',
    expected:
      '<div><p><img src="./subfolder/subimage.png" alt="title" class="lazyload" data-src="./subfolder/subimage.png" loading="lazy"></p></div>',
  },
  {
    env: 'dev',
    destination: 'subfolder/index.pug',
    input: 'div!=markdown("![title](foo.png)", { basePath: ".." })',
    expected:
      '<div><p><img src="../foo.png" alt="title" class="lazyload" data-src="../foo.png" loading="lazy"></p></div>',
  },
  {
    env: 'dev',
    destination: 'subfolder/index.pug',
    input: 'div!=markdown("![title](subimage.png)")',
    expected:
      '<div><p><img src="./subimage.png" alt="title" class="lazyload" data-src="./subimage.png" loading="lazy"></p></div>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'div!=markdown("![title](foo.png)")',
    expected:
      '<div><p><img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.h4sh.png&amp;af&amp;blur=5&amp;il&amp;q=50" alt="title" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.h4sh.png&amp;af&amp;il" loading="lazy"></p></div>',
  },
  {
    env: 'prod',
    destination: 'subfolder/index.pug',
    input: 'div!=markdown("![title](subimage.png)")',
    expected:
      '<div><p><img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Fsubfolder%2Fsubimage.h4sh.png&amp;af&amp;blur=5&amp;il&amp;q=50" alt="title" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Fsubfolder%2Fsubimage.h4sh.png&amp;af&amp;il" loading="lazy"></p></div>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input:
      'div!=markdown("![title](subimage.png)", { basePath: "./subfolder" })',
    expected:
      '<div><p><img src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Fsubfolder%2Fsubimage.h4sh.png&amp;af&amp;blur=5&amp;il&amp;q=50" alt="title" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Fsubfolder%2Fsubimage.h4sh.png&amp;af&amp;il" loading="lazy"></p></div>',
  },
];
const testCases = initTestCases([
  ...testCasesImageProxy,
  ...testCasesRevv,
  ...testCasesImgMethod,
  ...testCasesLazyload,
  ...testCasesImgMixin,
  ...testCasesScreenshot,
  ...testCasesMarkdown,
]);

describe('norska > images', () => {
  beforeAll(async () => {
    jest.spyOn(current, '__exit').mockReturnValue();
    jest.spyOn(netlify, 'shouldBuild').mockReturnValue(true);
    jest.spyOn(helper, 'latestGitCommit').mockReturnValue('abcdef');
    const devResults = await getTestResults(testCases.raw, 'dev');
    const prodResults = await getTestResults(testCases.raw, 'prod');
    testCases.results = { ...devResults, ...prodResults };
  });
  it.each(testCases.headers)('%s', (_testName, id) => {
    const result = testCases.results[id];
    expect(result.actual).toEqual(result.expected);
  });
});

/**
 * Create a global variable containing the test headers and the list of all
 * test cases, each with a unique id
 * @param {Array} rawItems Array of test cases
 * @returns {object} Object with .headers and .raw
 */
function initTestCases(rawItems) {
  // Check if some tests are focused and use only those
  const focusedItems = _.filter(rawItems, { focus: true });
  const items = focusedItems.length ? focusedItems : rawItems;

  const headers = [];
  const raw = items;
  _.each(items, (item) => {
    const { env, destination, input, expected } = item;
    const id = _.replace(uuid(), /-/g, '_');
    const testName = `[${env}:${destination}] ${input} => ${expected}`;

    item.input = _.replace(item.input, /\{testId\}/g, id);

    headers.push([testName, id]);
    item.id = id;
  });

  return { headers, raw };
}
/**
 * Build a website for the specified env with matching test input as pug files.
 * Extract results and return it, with unique id identifier for each key
 * @param {Array} allTestCases All test cases
 * @param {string} env Environment string (dev or build)
 * @returns {object} Object with id as keys for each test and results as value
 */
async function getTestResults(allTestCases, env) {
  // Setup config
  const tmpDirectory = `./tmp/norska/images/${env}`;
  await current.initConfig({
    from: `${tmpDirectory}/src`,
    to: `${tmpDirectory}/dist`,
    revv: {
      hashingMethod(inputFile) {
        return inputFile.replace('.png', '.h4sh.png');
      },
    },
  });
  await emptyDir(config.from());
  // Flag production on/off
  const isProduction = env === 'prod';
  jest.spyOn(helper, 'isProduction').mockReturnValue(isProduction);

  // Split tests by destination
  const testCasesByEnv = _.filter(allTestCases, { env });
  const testCasesByFile = _.chain(testCasesByEnv)
    .transform((result, testCase) => {
      const { destination, input, expected, id } = testCase;
      if (!result[destination]) {
        result[destination] = {
          inputs: [],
          expecteds: [],
          ids: [],
        };
      }
      result[destination].inputs.push(input);
      result[destination].expecteds.push(expected);
      result[destination].ids.push(id);
    }, {})
    .value();

  // Write test files
  await pProps(testCasesByFile, async (testCase, pugPath) => {
    const output = config.fromPath(pugPath);
    const pugContent = testCase.inputs.join('\n// SPLIT\n');
    await write(pugContent, output);
  });
  // Write data
  const dataSiteFile = config.fromPath('_data/site.json');
  const dataSiteContent = { defaultUrl: 'http://here.com' };
  await writeJson(dataSiteContent, dataSiteFile);
  // Write images
  await write('', config.fromPath('foo.png'));
  await write('', config.fromPath('subfolder/subimage.png'));

  // Build website
  const buildOutput = await captureOutput(async () => {
    await emptyDir(config.to());
    await current.build();
  });
  // Display console.log we could have used in debugging
  if (buildOutput.stdout.length) {
    consoleInfo(buildOutput.stdout.join('\n'));
  }
  // Check if build failed
  const buildFailed = current.__exit.mock.calls.length;
  if (buildFailed) {
    throw new Error(`Test build in ${env} failed`);
  }

  // Gather results
  await pProps(testCasesByFile, async (testCase, pugPath) => {
    const htmlPath = pugPath.replace(/\.pug$/, '.html');
    const htmlContent = await read(config.toPath(htmlPath));
    const actuals = _.chain(htmlContent)
      .split('<!-- SPLIT-->')
      .compact()
      .value();
    testCase.actuals = actuals;
  });

  // Convert results into a one dimensional array
  const testCasesAsObjects = _.chain(testCasesByFile)
    .transform((result, testCase, destination) => {
      const { inputs, expecteds, actuals, ids } = testCase;
      _.each(ids, (id, index) => {
        const input = inputs[index];
        const actual = actuals[index];
        const expected = expecteds[index];
        result[id] = { destination, input, expected, actual, id };
      });
    }, [])
    .value();
  return testCasesAsObjects;
}
