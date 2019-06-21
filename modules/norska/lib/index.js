import assets from 'norska-assets';
import config from 'norska-config';
import css from 'norska-css';
import helper from 'norska-helper';
import html from 'norska-html';
import init from 'norska-init';
import js from 'norska-js';
import screenshot from 'norska-screenshot';
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
    const safelist = ['build', 'init', 'screenshot', 'watch'];
    if (!_.includes(safelist, command)) {
      helper.consoleError(`Unknown command ${chalk.red(command)}`);
      helper.exit(1);
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
   * Build the website from source to destination
   **/
  async build() {
    await firost.mkdirp(config.to());

    await pAll([
      async () => {
        await html.run();
        await css.run();
      },
      async () => await js.run(),
      async () => await assets.run(),
    ]);
  },
  async watch() {
    await this.build();

    html.watch();
    css.watch();
    js.watch();
    assets.watch();

    liveServer.start({
      root: config.to(),
      port: config.get('port'),
      ignore: 'assets',
    });
  },
  async screenshot(options) {
    await screenshot.run(options);
  },
};
