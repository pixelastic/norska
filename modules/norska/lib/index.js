import assets from 'norska-assets';
import cms from 'norska-cms';
import config from 'norska-config';
import css from 'norska-css';
import helper from 'norska-helper';
import revv from 'norska-revv';
import html from 'norska-html';
import init from 'norska-init';
import js from 'norska-js';
import liveServer from 'live-server';
import { pAll, chalk, _ } from 'golgoth';
import firost from 'firost';

export default {
  /**
   * Parses CLI args and run the appropriate command
   * @param {object} cliArgs CLI Args, as returned by minimist
   **/
  async run(cliArgs) {
    const command = _.get(cliArgs, '_[0]', 'build');

    // Stop early if no such command exists
    const safelist = ['build', 'cms', 'init', 'screenshot', 'serve'];
    if (!_.includes(safelist, command)) {
      firost.consoleError(`Unknown command ${chalk.red(command)}`);
      firost.exit(1);
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
      await firost.remove(config.to());
    }
    await firost.mkdirp(config.to());

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
      firost.consoleError(chalk.red(error.code || 'Build Error'));
      firost.consoleError(chalk.red(error.message));
      firost.exit(1);
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
};
