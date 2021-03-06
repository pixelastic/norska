const config = require('norska-config');
const helper = require('norska-helper');
const netlify = require('norska-netlify');
const serve = require('norska-serve');
const _ = require('golgoth/lodash');
const chalk = require('golgoth/chalk');
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
      // The assets must be moved first so we can grab the image metadata
      // The HTML needs the list of JS files to include them
      // The CSS needs the HTML output to purge its list of classes
      // Running the asset copy in parallel to the js makes the js slow
      // Revv should be done once everything is copied
      await require('norska-assets').run();
      await require('norska-js').run();
      await require('norska-html').run();
      await require('norska-css').run();
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
    await serve.run();
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
