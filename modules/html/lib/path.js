const config = require('norska-config');
const helper = require('norska-helper');
const imageProxy = require('norska-image-proxy');
const isUrl = require('is-url-superb');
const normalizeUrl = require('firost/normalizeUrl');
const path = require('path');
const _ = require('golgoth/lib/lodash');
const placeholderize = require('norska-frontend/lib/lazyload/placeholderize');

module.exports = {
  /**
   * Cast a target into a remote url.
   * If target is already a URL, it will normalize it
   * If target is a local path, it will tranform it into a url
   *
   * @param {string} target URL or local path
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @returns {string} Remote url
   */
  remoteUrl(target, sourceFile) {
    if (this.isUrl(target)) {
      return normalizeUrl(target);
    }

    const productionUrl = config.get('runtime.productionUrl');
    const pathFromRoot = this.pathFromRoot(target, sourceFile);

    // Do not revv the url in dev
    if (!helper.isProduction()) {
      return normalizeUrl(`${productionUrl}/${pathFromRoot}`);
    }

    const revvedPath = this.revv(`/${pathFromRoot}`, 'index.pug');
    return `${productionUrl}/${revvedPath}`;
  },
  /**
   * Return the url of the specified page
   * @param {string} sourceFile Page to get the url of
   * @returns {string} Remote url
   **/
  pageUrl(sourceFile) {
    const productionUrl = config.get('runtime.productionUrl');
    return normalizeUrl(`${productionUrl}/${sourceFile}`);
  },
  /**
   * Mark the file for revving and returns a placeholder to replace with the
   * revved version
   * Path starting with / are considered relative to the root, other paths are
   * relative to the sourceFile
   
   * @param {string} target Path to a file
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @returns {string} Placeholder to be replaced with revved path
   **/
  revv(target, sourceFile) {
    // No revving in development
    if (!helper.isProduction()) {
      return this.pathFromFile(target, sourceFile);
    }

    const pathFromRoot = this.pathFromRoot(target, sourceFile);

    // We keep the / in the revv placeholder to indicate it should be replaced
    // with a path from the root, as opposed as from the sourceFile
    const isFromRoot = this.isFromRoot(target);
    const revvPath = isFromRoot ? `/${pathFromRoot}` : pathFromRoot;

    return `{revv: ${revvPath}}`;
  },
  /**
   * Cast a target into an image URL, through the image proxy
   * If image is local, it will revv it first
   *
   * @param {string} target URL or local path
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @param {object} options Image CDN option
   * @returns {string} Image url
   */
  img(target, sourceFile, options) {
    // Remote url goes through proxy
    if (this.isUrl(target)) {
      return imageProxy(normalizeUrl(target), options);
    }

    // No proxy in development for local files
    if (!helper.isProduction()) {
      return this.pathFromFile(target, sourceFile);
    }

    const remoteUrl = this.remoteUrl(target, sourceFile);
    return imageProxy(remoteUrl, options);
  },
  /**
   * Returns the .full and .placeholder urls to be used for lazyloading
   
   * @param {string} target URL or local path
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @param {object} options Image CDN option
   * @param {boolean} options.disable If set to true, placeholder is the same as
   * the full
   * @param {object} options.placeholder Placeholder specific options
   * @returns {object} Object with .full and .placeholder keys
   **/
  lazyload(target, sourceFile, options) {
    const fullOptions = _.omit(options, ['disable', 'placeholder']);
    const fullUrl = this.img(target, sourceFile, fullOptions);

    const isDisabled = _.get(options, 'disable', false);
    const isDev = !helper.isProduction();
    const isLocal = !this.isUrl(target);

    // When disabled or when targeting local files in dev, placeholder is the same as the full url
    if (isDisabled || (isDev && isLocal)) {
      return {
        full: fullUrl,
        placeholder: fullUrl,
      };
    }

    const placeholderOptions = _.omit(options, ['disable']);
    const placeholderUrl = placeholderize(
      this.remoteUrl(target, sourceFile),
      placeholderOptions
    );

    return {
      full: fullUrl,
      placeholder: placeholderUrl,
    };
  },
  /**
   * Returns the path to a screenshot of the specified page
   * Latest commit hash will be used to bust the proxy cache
   *
   * @param {string} target URL or local path, default to current page
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @returns {string} Url to the screenshot
   **/
  screenshot(target, sourceFile) {
    let url;

    // Use the specified target if passed (local or remote), or use the current
    // url if not
    const urlTarget = target || sourceFile;
    const pageUrl = this.isUrl(urlTarget) ? urlTarget : this.pageUrl(urlTarget);

    // Pass to microlink API
    url = new URL('https://api.microlink.io/');
    url.search = new URLSearchParams({
      embed: 'screenshot.url',
      meta: false,
      screenshot: true,
      url: normalizeUrl(pageUrl),
    });
    const microlinkUrl = normalizeUrl(url.toString());

    // Add the latest git commit, to force a unique url on deploy
    url = new URL(microlinkUrl);
    const gitCommit = config.get('runtime.gitCommit');
    url.searchParams.append('norskaGitCommit', gitCommit);
    const revvedUrl = normalizeUrl(url.toString());

    // Pass through the image proxy
    const options = { width: 800 };
    return imageProxy(revvedUrl, options);
  },
  /**
   * Check if the given target is a url
   * @param {string} target URL or local path
   * @returns {boolean} True if a URL
   **/
  isUrl(target) {
    return isUrl(target);
  },
  /**
   * Check if the given target should be considered coming from the root (ie.
   * starting with a /)
   * @param {string} target URL or local path
   * @returns {boolean} True if should be considered relative to the root
   **/
  isFromRoot(target) {
    return target.startsWith('/');
  },
  /**
   * Cast a target into a relative path from the specified file
   * Path starting with / are considered relative to the root, other paths are
   * relative to the sourceFile
   * @param {string} target Path to a file
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @returns {string} Shortest relative path from sourceFile
   **/
  pathFromFile(target, sourceFile) {
    const isFromRoot = this.isFromRoot(target);
    const sourceDirectory = path.dirname(config.toPath(sourceFile));

    const fullTarget = isFromRoot
      ? config.toPath(_.trimStart(target, '/'))
      : path.resolve(sourceDirectory, target);

    return path.relative(sourceDirectory, fullTarget);
  },
  /**
   * Cast a target into a relative path from the destination root
   * Path starting with / are considered relative to the root, other paths are
   * relative to the sourceFile
   
   * @param {string} target Path to a file
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @returns {string} Path from the root
   **/
  pathFromRoot(target, sourceFile) {
    const pathFromFile = this.pathFromFile(target, sourceFile);
    const sourceDirectory = path.dirname(config.toPath(sourceFile));
    const fullTarget = path.resolve(sourceDirectory, pathFromFile);

    return path.relative(config.to(), fullTarget);
  },
  /**
   * Returns the simplest link between the sourceFile and the
   * destination
   * @param {string} target Path to a file
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @returns {string} Link from sourceFile to target
   **/
  link(target, sourceFile) {
    // Remote url are kept remote
    if (this.isUrl(target)) {
      return normalizeUrl(target);
    }

    const fromFile = this.pathFromFile(target, sourceFile);
    // Current page
    if (!fromFile) {
      return '.';
    }

    // Add a final slash for directories
    const hasExtension = !!path.extname(target);
    return hasExtension ? fromFile : `${fromFile}/`;
  },
};