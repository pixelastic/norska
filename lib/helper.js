import _ from 'lodash';
import path from 'path';
import chalk from 'chalk';
import chokidar from 'chokidar';
import firost from 'firost';
import config from './config';

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
  async writeFile(filepath, content) {
    await firost.writeFile(filepath, content);

    const extname = path.extname(filepath);
    let displayName = filepath;
    const colors = {
      '.html': 'magenta',
      '.css': 'yellow',
      '.js': 'green',
    };
    if (colors[extname]) {
      displayName = chalk[colors[extname]](displayName);
    }

    console.info(`✔ Saving ${displayName}`);
  },
  // Watch for file changes and react
  watch(pattern, callback) {
    const watcher = chokidar.watch(pattern);
    watcher.on('change', _.debounce(callback, 500, { leading: true }));
  },
};
