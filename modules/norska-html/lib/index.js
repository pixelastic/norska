import helper from 'norska-helper';
import config from 'norska-config';
import path from 'path';
import { _, pMap, firost } from 'golgoth';
import pug from 'pug';

export default {
  // Compile a pug file to an html one
  async compile(filepath) {
    const basename = _.replace(
      path.relative(config.from(), filepath),
      '.pug',
      '.html'
    );
    const destination = path.join(config.to(), basename);

    const rawContent = await firost.read(filepath);
    const pugCompile = pug.compile(rawContent, { filename: filepath });

    // Compile layout
    const siteData = await helper.siteData();
    const htmlContent = pugCompile(siteData);

    // Save to disk
    await helper.writeFile(htmlContent, destination);
  },

  async run() {
    const pugFiles = await helper.getFiles('*.pug');
    await pMap(pugFiles, async filepath => {
      await this.compile(filepath);
    });
  },

  // Listen to changes in pug and update
  watch() {
    const from = config.from();
    // Update HTML on each markdown change
    firost.watch(`${from}/*.pug`, filepath => {
      this.compile(filepath);
    });
    // Rebuild everything when a layout, include or data changes
    firost.watch(
      [
        `${from}/_layouts/*.pug`,
        `${from}/_includes/*.pug`,
        `${from}/_mixins/*.pug`,
        `${from}/_data.json`,
      ],
      () => {
        this.run();
      }
    );
  },
};
