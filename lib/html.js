import helper from './helper';
import _ from 'lodash';
import path from 'path';
import pug from 'pug';
import pMap from 'p-map';

export default {
  // Compile a pug file to an html one
  async compile(filepath) {
    const basename = _.replace(
      path.relative('./src', filepath),
      '.pug',
      '.html'
    );
    const destination = `./dist/${basename}`;

    const rawContent = await helper.readFile(filepath);
    const pugCompile = pug.compile(rawContent, { filename: filepath });

    // Compile layout
    const siteData = await helper.siteData();
    const htmlContent = pugCompile(siteData);

    // Save to disk
    await helper.writeFile(destination, htmlContent);
  },

  async run() {
    const pugFiles = await helper.getFiles('*.pug');
    await pMap(pugFiles, async filepath => {
      await this.compile(filepath);
    });
  },

  // Listen to changes in pug and update
  watch() {
    // Update HTML on each markdown change
    helper.watch('./src/*.pug', filepath => {
      this.compile(filepath);
    });
    // Rebuild everything when a layout, include or data changes
    helper.watch(
      [
        './src/_layouts/*.pug',
        './src/_includes/*.pug',
        './src/_mixins/*.pug',
        './src/_data.json',
      ],
      () => {
        this.run();
      }
    );
  },
};
