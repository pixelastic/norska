import { _, chalk, firost } from 'golgoth';
import path from 'path';
import config from 'norska-config';
import timeSpan from 'time-span';

export default {
  // Return the site global data
  async siteData() {
    const from = config.get('from');
    const configFile = path.join(from, '_data.json');

    // Check that the file actually exists
    const configFileExists = await firost.exists(configFile);
    if (!configFileExists) {
      console.info(chalk.yellow(`⚠ Cannot find config file in ${configFile}`));
      return {};
    }

    return await firost.readJson(configFile);
  },
  // Write a file to disk
  async writeFile(what, where, timer) {
    await firost.write(what, where);

    const extname = path.extname(where);
    const to = config.to();
    let displayName = path.relative(to, where);
    const colors = {
      '.html': 'magenta',
      '.css': 'yellow',
    };
    if (colors[extname]) {
      displayName = chalk[colors[extname]](displayName);
    }

    let message = `✔ Saving ${displayName}`;
    if (timer) {
      message = `${message} in ${timer.elapsed()}`;
    }

    console.info(message);
  },
  timer() {
    const running = timeSpan();
    return {
      elapsed() {
        return `${_.round(running.seconds(), 2)}s`;
      },
    };
  },
};
