const helper = require('./helper.js');
const { merge } = require('lodash-es');
module.exports = {
  /**
   * Convert a routeState to a uiState, including default values
   * @param {object} routeState Current route state
   * @returns {object} UI State
   **/
  routeToState(routeState) {
    const indexName = helper.indexName();
    const defaultUiState = helper.configValue('defaultUiState');
    return merge({}, { [indexName]: defaultUiState }, routeState);
  },
  /**
   * Convert a uiState to a routeState
   * It's a simple proxy, not doing anything
   * @param {object} uiState Current UI state
   * @returns {object} Route state
   **/
  stateToRoute(uiState) {
    return uiState;
  },
};
