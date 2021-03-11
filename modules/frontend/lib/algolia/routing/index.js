const router = require('./router.js');
const stateMapping = require('./stateMapping.js');
const instantsearch = require('instantsearch.js/cjs').default;

module.exports = {
  router: instantsearch.routers.history(router),
  stateMapping,
};
