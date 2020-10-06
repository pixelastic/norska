const theme = require('norska-theme-docs');
const _ = require('golgoth/lib/lodash');

module.exports = {
  theme,
  hooks: {
    afterHtml({ createPage }) {
      const tailwind = require('./src/_data/tailwind.js');
      const pages = _.chain(tailwind)
        .get('links')
        .map('items')
        .flatten()
        .map('url')
        .sort()
        .value();
      console.info(pages);
    },
  },
};
