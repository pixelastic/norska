const assets = require('norska-assets');
const cms = require('norska-cms');
const config = require('norska-config');
const css = require('norska-css');
const helper = require('norska-helper');
const revv = require('norska-revv');
const html = require('norska-html');
const init = require('norska-init');
const js = require('norska-js');
const liveServer = require('live-server');
const _ = require('golgoth/lib/lodash');
const chalk = require('golgoth/lib/chalk');
const pAll = require('golgoth/lib/pAll');
const consoleError = require('firost/lib/consoleError');
const exit = require('firost/lib/exit');
const mkdirp = require('firost/lib/mkdirp');
const remove = require('firost/lib/remove');

module.exports = {
  /**
   * Parses CLI args and run the appropriate command
   * @param {object} cliArgs CLI Args, as returned by minimist
   **/
  async run(cliArgs) {
    const command = _.get(cliArgs, '_[0]', 'build');

    // Stop early if no such command exists
    const safelist = ['build', 'cms', 'init', 'screenshot', 'serve'];
    if (!_.includes(safelist, command)) {
      this.__consoleError(`Unknown command ${chalk.red(command)}`);
      this.__exit(1);
      return;
    }

    // Remove the initial method from args passed to the command
    cliArgs._ = _.drop(cliArgs._, 1);
    await this.initConfig(cliArgs);

    await this[command]();
  },
  /**
   * Init the config singleton with both the user-defined values passed from the
   * command line, and the default list of module config
   * @param {object} cliArgs CLI Args, as returned by minimist
   **/
  async initConfig(cliArgs) {
    const modulesConfig = {
      assets: assets.defaultConfig(),
      cms: cms.defaultConfig(),
      css: css.defaultConfig(),
      js: js.defaultConfig(),
      revv: revv.defaultConfig(),
    };
    await config.init(cliArgs, modulesConfig);
  },
  /**
   * Init a new norska project, by scaffolding needed files
   **/
  async init() {
    await init.run();
  },
  /**
   * Build the website, compiling all files in .from()
   **/
  async build() {
    if (helper.isProduction()) {
      await remove(config.to());
    }
    await mkdirp(config.to());

    try {
      // We unfortunately need to run those in sequence
      // The HTML needs the list of JS files to include them
      // The CSS needs the HTML output to purge its list of classes
      // Running the asset copy in parallel to the js makes the js slow
      // Revv should be done once everything is copied
      await js.run();
      await html.run();
      await css.run();
      await assets.run();
      await revv.run();
    } catch (error) {
      this.__consoleError(chalk.red(error.code || 'Build Error'));
      this.__consoleError(chalk.red(error.message));
      this.__exit(1);
    }
  },
  /**
   * Dynamically build and serve the website, listening to changes and
   * rebuilding if needed
   **/
  async serve() {
    await this.build();

    await pAll([
      async () => await html.watch(),
      async () => await css.watch(),
      async () => await js.watch(),
      async () => await assets.watch(),
    ]);

    liveServer.start({
      root: config.to(),
      port: config.get('port'),
    });
  },
  /**
   * Start the local CMS, to edit _data files
   **/
  async cms() {
    await cms.run();
  },
  __consoleError: consoleError,
  __exit: exit,
};
