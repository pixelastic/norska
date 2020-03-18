const module = require('../main');
const pProps = require('golgoth/lib/pProps');
const _ = require('golgoth/lib/lodash');
const uuid = require('firost/lib/uuid');
const config = require('norska-config');
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
const testCases = initTestCases([
  // Cloudinary
  // Should ignore local files in dev
  // Should convert local files to remote in prod
  // Should pass all remote files through our bucket
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src=cloudinary("foo.png"))',
    expected: '<img src="foo.png"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src=cloudinary("foo.png"))',
    expected:
      '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://here.com/foo.png"/>',
  },
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src=cloudinary("http://there.com/foo.png"))',
    expected:
      '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://there.com/foo.png"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src=cloudinary("http://there.com/foo.png"))',
    expected:
      '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://there.com/foo.png"/>',
  },
  // Revv
  // Should ignore files in dev
  // Should revv files in prod
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src=revv("foo.png"))',
    expected: '<img src="foo.png"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src=revv("foo.png"))',
    expected: '<img src="foo.h4sh.png"/>',
  },
  // Img
  // Should ignore local files in dev
  // Should revv and pass through cloudinary local files in prod
  // Should pass through cloudinary remote files
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src=img("foo.png"))',
    expected: '<img src="foo.png"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src=img("foo.png"))',
    expected:
      '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://here.com/foo.h4sh.png"/>',
  },
  {
    env: 'dev',
    destination: 'index.pug',
    input: 'img(src=img("http://there.com/foo.png"))',
    expected:
      '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://there.com/foo.png"/>',
  },
  {
    env: 'prod',
    destination: 'index.pug',
    input: 'img(src=img("http://there.com/foo.png"))',
    expected:
      '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://there.com/foo.png"/>',
  },
]);

describe('norska > images', () => {
  beforeAll(async () => {
    jest.spyOn(module, '__exit').mockReturnValue();
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
 * @param {Array} items Array of test cases
 * @returns {object} Object with .headers and .raw
 */
function initTestCases(items) {
  const headers = [];
  const raw = items;
  _.each(items, item => {
    const { env, destination, input, expected } = item;
    const id = uuid();
    const testName = `[${env}:${destination}] ${input} => ${expected}`;

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
  await module.initConfig({
    from: `${tmpDirectory}/src`,
    to: `${tmpDirectory}/dist`,
    cloudinary: {
      bucketName: 'bucket',
    },
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
    const pugContent = testCase.inputs.join('\n');
    await write(pugContent, output);
  });
  // Write data
  const dataSiteFile = config.fromPath('_data/site.json');
  const dataSiteContent = { defaultUrl: 'http://here.com' };
  await writeJson(dataSiteContent, dataSiteFile);
  // Write image
  const imageFile = config.fromPath('foo.png');
  await write('', imageFile);

  // Build website
  const buildOutput = await captureOutput(async () => {
    await emptyDir(config.to());
    await module.build();
  });
  // Display console.log we could have used in debugging
  if (buildOutput.stdout.length) {
    consoleInfo(buildOutput.stdout.join('\n'));
  }
  // Check if build failed
  const buildFailed = module.__exit.mock.calls.length;
  if (buildFailed) {
    throw new Error(`Test build in ${env} failed`);
  }

  // Gather results
  await pProps(testCasesByFile, async (testCase, pugPath) => {
    const htmlPath = pugPath.replace(/\.pug$/, '.html');
    const htmlContent = await read(config.toPath(htmlPath));
    const actuals = _.chain(htmlContent)
      .split('/>')
      .compact()
      .map(item => `${item}/>`)
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

//    const testCases = [
//    ];
//    describe('in dev', () => {
//      let testResults = null;
//      beforeEach(async () => {
//        jest.spyOn(helper, 'isProduction').mockReturnValue(false);
//        testResults = await getTestResults(testCases, 'dev');
//      });
//      it.each(testCases)('%s', async input => {
//        expect(testResults).not.toHaveProperty('buildFailed', true);
//        const result = testResults[input];
//        expect(result.actual).toEqual(result.expectedDev);
//      });
//    });
//    describe('in prod', () => {
//      let testResults = null;
//      beforeEach(async () => {
//        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
//        testResults = await getTestResults(testCases, 'prod');
//      });
//      it.each(testCases)('%s', async input => {
//        expect(testResults).not.toHaveProperty('buildFailed', true);
//        const result = testResults[input];
//        expect(result.actual).toEqual(result.expectedProd);
//      });
//    });
//  });
//});
