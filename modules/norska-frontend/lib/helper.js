const { get, invert, parseInt } = require('lodash-es');
const _ = require('lodash');

module.exports = {
  __baseUrl: null,
  rootUrl() {
    if (!this.__baseUrl) {
      this.__baseUrl = document
        .querySelector('script[src]')
        .src.split('/')
        .slice(0, -1)
        .join('/');
    }
    return this.__baseUrl;
  },
};

