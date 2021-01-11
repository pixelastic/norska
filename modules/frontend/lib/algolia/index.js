const algolia = require('algoliasearch/lite');
const instantsearch = require('instantsearch.js/cjs').default;
const router = require('./router');
const credentials = require('./credentials');
const transformHits = require('./transformHits');
const { filter } = require('lodash-es');
const hitsWidget = require('./widgets').hits;
const infiniteHitsWidget = require('./widgets').infiniteHits;
const configureWidget = require('./widgets').configure;
const config = require('./config.js');

module.exports = {
  __client: null,
  __widgets: [],
  __transforms: {},
  __onDisplay: null,
  __onSearch: null,
  /**
   * Init the search with credentials
   * @param {object} userCredentials object. Should include appId,
   * apiKey and indexName
   * @param {object} options Options to modify behavior
   * @param {Array} options.routerIgnore List of keys to not track in the router
   * @returns {object} Algolia instance, for chaining
   **/
  init(userCredentials, options = {}) {
    credentials.init(userCredentials);
    const { appId, apiKey, indexName } = userCredentials;
    config.options = { ...config.options, ...options };

    this.__client = instantsearch({
      indexName,
      searchClient: algolia(appId, apiKey),
      routing: {
        router: instantsearch.routers.history(router),
      },
      searchFunction: (helper) => {
        return this.searchFunction(helper);
      },
    });

    return this;
  },
  /**
   * Search function called on each search
   * See
   * https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/#widget-param-searchfunction
   * for details
   * @param {object} helper Algolia helper object
   **/
  searchFunction(helper) {
    const query = helper.state.query;
    if (this.__onSearch) {
      this.__onSearch(query);
    }
    helper.search();
  },
  /**
   * Define the list of widgets to use
   * @param {Array} widgets List of widgets
   * @returns {object} Algolia instance, for chaining
   **/
  setWidgets(widgets) {
    this.__widgets = filter(widgets, this.hasContainer.bind(this));
    return this;
  },
  /**
   * Define the list of transforms to apply on the hits
   * @param {object} transforms Transforms to apply on each hit
   * @returns {object} Algolia instance, for chaining
   **/
  setTransforms(transforms) {
    this.__transforms = transforms;
    return this;
  },
  /**
   * Define an optional method to call on each hit before displaying it
   * Mostly useful for debugging
   * @param {Function} onDisplay Method to call on each hit before display
   * @returns {object} Algolia instance, for chaining
   **/
  onDisplay(onDisplay) {
    this.__onDisplay = onDisplay;
    return this;
  },
  /**
   * Define an optional method to call on each search
   * @param {Function} onSearch Method to call on each search request
   * @returns {object} Algolia instance, for chaining
   **/
  onSearch(onSearch) {
    this.__onSearch = onSearch;
    return this;
  },
  /**
   * Checks if a given widget has a container available
   * Always returns true for configure widget as it does not require a container
   * @param {object} widget Widget definition
   * @returns {boolean} True if container is in the document
   **/
  hasContainer(widget) {
    if (this.isConfigureWidget(widget)) {
      return true;
    }
    if (!widget.options || !widget.options.container) {
      return false;
    }

    const containerSelector = widget.options.container;
    const hasContainer = this.__documentQuerySelector(containerSelector);
    return hasContainer;
  },
  /**
   * Starts the search, initializing the widgets and sending the initial query
   **/
  start() {
    // Finding the hits record and enhancing the results
    const widgets = this.__widgets.map((widget) => {
      const isHitWidget = widget.type === hitsWidget;
      const isInfiniteHitWidget = widget.type === infiniteHitsWidget;

      // Transforming hits before display
      if (isHitWidget || isInfiniteHitWidget) {
        widget.options.transformItems = (items) => {
          return transformHits(items, this.__transforms, this.__onDisplay);
        };
      }

      return widget.type(widget.options);
    });

    this.__client.addWidgets(widgets);
    this.__client.start();
  },
  /**
   * Checks if the given widget is a configure widget
   * @param {object} widget Widget definition
   * @returns {boolean} true if configure widget, false otherwise
   **/
  isConfigureWidget(widget) {
    return widget.type === configureWidget;
  },
  __documentQuerySelector(selector) {
    return document.querySelector(selector);
  },
};
