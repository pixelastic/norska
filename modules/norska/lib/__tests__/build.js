const module = require('../main');
const _ = require('golgoth/lib/lodash');
const config = require('norska-config');
const helper = require('norska-helper');
const consoleInfo = require('firost/lib/consoleInfo');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const writeJson = require('firost/lib/writeJson');
const read = require('firost/lib/read');

const buildCache = {};
/**
 * Build a website, with an index.pug containing the specified testCases
 * and return an object containing the expected and actual results in html
 *
 * @param {Array} testCases List of test cases [input, expected]
 * @param {string} buildName A unique build identifier, used as a subdirectory
 * @returns {object} Object where each key is an input and values have .actual
 * and .expected keys
 */
async function getTestResults(testCases, buildName) {
  // Return results from cache
  if (buildCache[buildName]) {
    return buildCache[buildName];
  }

  const tmpDirectory = `./tmp/norska/build/${buildName}`;
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

  // Write file pug file
  const pugFile = config.fromPath('index.pug');
  const pugContent = _.chain(testCases)
    .map(_.first)
    .join('\n')
    .value();
  await write(pugContent, pugFile);

  // Write data
  const dataSiteFile = config.fromPath('_data/site.json');
  const dataSiteContent = { defaultUrl: 'http://a.com' };
  await writeJson(dataSiteContent, dataSiteFile);

  // Write image
  const imageFile = config.fromPath('foo.png');
  await write('', imageFile);

  const output = await captureOutput(async () => {
    await emptyDir(config.to());
    await module.build();
  });
  // Display console.log we could have used in debugging
  if (output.stdout.length) {
    consoleInfo(output.stdout.join('\n'));
  }
  // Check if build failed
  const buildFailed = module.__exit.mock.calls.length;
  if (buildFailed) {
    return (buildCache[buildName] = { buildFailed: true });
  }

  // Create an object of each input, including actual and expected
  const htmlFile = config.toPath('index.html');
  const results = _.chain(await read(htmlFile))
    .split('/>')
    .compact()
    .transform((result, rawActual, index) => {
      const actual = `${rawActual}/>`;
      const [input, expectedDev, expectedProd] = testCases[index];
      result[input] = { expectedDev, expectedProd, actual };
    })
    .value();

  return (buildCache[buildName] = results);
}

describe('norska > build', () => {
  beforeEach(async () => {
    jest.spyOn(module, '__exit').mockReturnValue();
  });
  describe('images', () => {
    const testCases = [
      [
        'img(src=cloudinary("foo.png"))',
        '<img src="foo.png"/>',
        '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://a.com/foo.png"/>',
      ],
      [
        'img(src=cloudinary("./foo.png"))',
        '<img src="./foo.png"/>',
        '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://a.com/foo.png"/>',
      ],
      [
        'img(src=cloudinary("http://a.com/foo.png"))',
        '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://a.com/foo.png"/>',
        '<img src="https://res.cloudinary.com/bucket/image/fetch/f_auto/http://a.com/foo.png"/>',
      ],
      [
        'img(src=revv("foo.png"))',
        '<img src="foo.png"/>',
        '<img src="foo.h4sh.png"/>',
      ],
    ];
    describe('in dev', () => {
      let testResults = null;
      beforeEach(async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(false);
        testResults = await getTestResults(testCases, 'dev');
      });
      it.each(testCases)('%s', async input => {
        expect(testResults).not.toHaveProperty('buildFailed', true);
        const result = testResults[input];
        expect(result.actual).toEqual(result.expectedDev);
      });
    });
    describe('in prod', () => {
      let testResults = null;
      beforeEach(async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
        testResults = await getTestResults(testCases, 'prod');
      });
      it.each(testCases)('%s', async input => {
        expect(testResults).not.toHaveProperty('buildFailed', true);
        const result = testResults[input];
        expect(result.actual).toEqual(result.expectedProd);
      });
    });
  });
});
