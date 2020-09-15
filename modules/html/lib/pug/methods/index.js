const _ = require('golgoth/lib/lodash');
const include = require('./include.js');
const mixinHelperHead = require('../mixins/helpers/head.js');
const mixinHelperImg = require('../mixins/helpers/img.js');
const path = require('../../path.js');
const markdownConvert = require('../../markdown/convert.js');

module.exports = function (data, sourceFile) {
  const methods = {
    // Global lodash
    _,
    // Getting an image url (eg. for CSS background)
    img(url) {
      return path.img(url, sourceFile);
    },
    // Recursive include of any file
    include(url) {
      // Pass a context containing all the methods recursively
      const includeContext = { data, methods };
      return include(url, includeContext);
    },
    // Check if target point to the current page
    isCurrentPage(target) {
      return path.pageUrl(target) === path.pageUrl(sourceFile);
    },
    // Find the simplest link to a file
    link(target) {
      return path.link(target, sourceFile);
    },
    // Convert markdown to HTML
    markdown(markdownSource, options = {}) {
      return markdownConvert.run(markdownSource, sourceFile, options);
    },
    // Revving assets manually (eg. css files)
    revv(url) {
      return path.revv(url, sourceFile);
    },
    // Url to a screenshot of any page
    screenshot(url) {
      return path.screenshot(url, sourceFile);
    },
    // These methods are only used in specific mixins
    mixinHelpers: {
      img(attributes) {
        return mixinHelperImg(attributes, sourceFile);
      },
      head(meta) {
        return mixinHelperHead(meta, data.site, sourceFile);
      },
    },
  };

  return methods;
};
