import { chalk, firost } from 'golgoth';
import path from 'path';
import config from 'norska-config';

export default {
  async getFiles(pattern) {
    const from = config.get('from');
    return await firost.glob(`${from}/${pattern}`);
  },
  // Return the site global data
  async siteData() {
    const from = config.get('from');
    const configFile = path.join(from, '_data.json');
    return await firost.readJson(configFile);
  },
  // Write a file to disk
  async writeFile(what, where) {
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

    console.info(`✔ Saving ${displayName}`);
  },
};
