/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect*"] }] */
const current = require('../main');
const config = require('norska-config');
const data = require('norska-data');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
const uuid = require('firost/uuid');
const unwatchAll = require('firost/unwatchAll');
const waitForWatchers = require('firost/waitForWatchers');

describe('norska-html > watch', () => {
  const tmpDirectory = './tmp/norska-html/watch';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await emptyDir(tmpDirectory);
    jest.spyOn(current, 'compile').mockReturnValue();
    jest.spyOn(current, 'run').mockReturnValue();
    jest.spyOn(current, '__consoleSuccess').mockReturnValue();
    jest.spyOn(current, '__consoleError').mockReturnValue();
    jest.spyOn(data, 'updateCache').mockReturnValue();
    // Prevent tests from adding more and more listeners
    config.pulse.removeAllListeners();
  });
  afterEach(async () => {
    await unwatchAll();
  });
  // Write/update a file with random content
  const writeFile = async (filepath) => {
    await write(uuid(), config.fromPath(filepath));
    await waitForWatchers();
  };
  // Execute code while watching and stops after watchers have finished
  const whileWatching = async (callback) => {
    await current.watch();
    await callback();
    await waitForWatchers();
  };
  // Expect filepath to have been compiled
  const expectToHaveCompiled = (filepath) => {
    expect(current.compile).toHaveBeenCalledWith(config.fromPath(filepath));
  };

  it('compiles individual files when changed', async () => {
    await writeFile('initial.pug');
    await writeFile('initial.md');

    await whileWatching(async () => {
      await writeFile('initial.pug');
      await writeFile('new-file.pug');

      await writeFile('initial.md');
      await writeFile('new-file.md');
    });

    expectToHaveCompiled('initial.pug');
    expectToHaveCompiled('new-file.pug');
    expectToHaveCompiled('initial.md');
    expectToHaveCompiled('new-file.md');
  });
  it('compiles everything when top level files are changed', async () => {
    await whileWatching(async () => {
      await writeFile('_data/projects.js');
      await writeFile('_data/users.json');
      await writeFile('_data/blog/tags.json');

      await writeFile('_includes/templates/hit.pug');
      await writeFile('_includes/layouts/core.pug');

      config.set('runtime.jsFiles', ['new files']);
    });

    // One call at init, then one on each data change
    expect(current.run).toHaveBeenCalledTimes(6);
    expect(current.run).toHaveBeenCalledTimes(6);
  });
  it('should display the errors', async () => {
    current.compile.mockImplementation(() => {
      throw new Error('Something wrong');
    });
    await whileWatching(async () => {
      await writeFile('initial.pug');
    });

    expect(current.__consoleError).toHaveBeenCalledWith(
      expect.stringMatching('Something wrong')
    );
  });
});
