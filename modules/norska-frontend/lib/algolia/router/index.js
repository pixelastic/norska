const helper = require('./helper.js');
const { isEmpty, pick, merge, map } = require('lodash-es');
/**
 * All filters of the current search are encoded in the URL hash
 * Simple filters like query and page are simple query:foo and page:42
 * Each filter is separated by a /
 * Refinement list are encoded as key:[value1,value2]
 * Ranges as key:{min,max}
 **/
module.exports = {
  /**
   * Create a full url from a routeState
   * @param {object} {routeState} Object containing all the filters
   * @returns {string} Full url
   **/
  createURL({ routeState }) {
    const indexName = helper.indexName();
    const currentUrl = helper.currentUrl();
    const parameters = routeState[indexName];
    if (isEmpty(parameters)) {
      return currentUrl;
    }

    // All meta-filters (page, query, etc)
    const rootFilters = pick(parameters, helper.metaKeys);

    // All normal filters (refinementList, range)
    const filterValues = Object.values(pick(parameters, helper.filterKeys));
    const deepFilters = merge(...filterValues);

    // Any index-level filter (sortBy/index)
    const sortByIndex = parameters.sortBy;
    let indexFilters = {};
    if (sortByIndex) {
      const isReplica = helper.isReplica(sortByIndex);
      const filterKey = isReplica ? 'sortBy' : 'index';
      const filterValue = isReplica
        ? helper.replicaShortname(sortByIndex)
        : sortByIndex;
      indexFilters[filterKey] = filterValue;
    }

    const allFilters = { ...rootFilters, ...deepFilters, ...indexFilters };
    const stringFilters = map(allFilters, helper.keyValueToString.bind(helper));
    const locationHash = stringFilters.sort().join('/');

    return `${currentUrl}#${locationHash}`;
  },
  /**
   * Parse a full url to a routeState
   * @param {object} {location} Page location object
   * @returns {object} Route state from the url
   **/
  parseURL({ location }) {
    const hash = location.hash;
    const indexName = helper.indexName();
    if (!hash) {
      return { [indexName]: {} };
    }

    const stringFilters = hash.replace(/^#/, '').split('/');
    const allFilters = stringFilters.map(filter => {
      return helper.stringToFilterObject(filter);
    });
    const routeState = merge(...allFilters);

    const sortByIndex = helper.sortByIndexFromLocationHash(hash);
    if (sortByIndex) {
      routeState.sortBy = sortByIndex;
    }

    return {
      [indexName]: routeState,
    };
  },
};

