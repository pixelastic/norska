const config = require('norska-config');
const helper = require('norska-helper');
const netlify = require('norska-netlify');
const liveServer = require('live-server');
const _ = require('golgoth/lodash');
const chalk = require('golgoth/chalk');
const pAll = require('golgoth/pAll');
const consoleError = require('firost/consoleError');
const exit = require('firost/exit');
const mkdirp = require('firost/mkdirp');
const remove = require('firost/remove');

module.exports = {
  /**
   * List of allowed commands to run
   * @returns {Array} List of allowed commands to run
   **/
  safelist() {
    return ['build', 'cms', 'init', 'serve'];
  },
  /**
   * Parses CLI args and run the appropriate command
   * @param {object} cliArgs CLI Args, as returned by minimist
   **/
  async run(cliArgs) {
    const commandName = _.get(cliArgs, '_[0]', 'build');

    // Stop early if no such command exists
    if (!_.includes(this.safelist(), commandName)) {
      this.__consoleError(`Unknown command ${chalk.red(commandName)}`);
      this.__exit(1);
      return;
    }

    // Remove the initial method from args passed to the command
    cliArgs._ = _.drop(cliArgs._, 1);
    await this.initConfig(cliArgs);

    try {
      await this[commandName]();
    } catch (err) {
      this.__consoleError(err.message);
      this.__exit(1);
    }
  },
  /**
   * Init the config singleton with both the user-defined values passed from the
   * command line, and the default list of module config
   * @param {object} cliArgs CLI Args, as returned by minimist
   **/
  async initConfig(cliArgs) {
    const modulesConfig = {
      assets: require('norska-assets/lib/config'),
      cms: require('norska-cms/lib/config'),
      css: require('norska-css/lib/config'),
      js: require('norska-js/lib/config'),
      netlify: require('norska-netlify/lib/config'),
      revv: require('norska-revv/lib/config'),
    };
    await this.__configInit(cliArgs, modulesConfig);
  },
  /**
   * Init a new norska project, by scaffolding needed files
   **/
  async init() {
    await require('norska-init').run();
  },
  /**
   * Build the website, compiling all files in .from()
   **/
  async build() {
    // Stop the build if not relevant to a deploy
    if (!(await netlify.shouldBuild())) {
      await netlify.cancelBuild();
      return;
    }

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
      await require('norska-js').run();
      await require('norska-html').run();
      await require('norska-css').run();
      await require('norska-assets').run();
      await require('norska-revv').run();
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

    const js = require('norska-js');
    const html = require('norska-html');
    const css = require('norska-css');
    const assets = require('norska-assets');

    await pAll([
      async () => await html.watch(),
      async () => await css.watch(),
      async () => await js.watch(),
      async () => await assets.watch(),
    ]);

    liveServer.start({
      root: config.to(),
      port: config.get('port'),
      open: config.get('open'),
    });
  },
  /**
   * Start the local CMS, to edit _data files
   **/
  async cms() {
    await require('norska-cms').run();
  },
  __consoleError: consoleError,
  __exit: exit,
  __require: require,
  __configInit: config.init.bind(config),
};
