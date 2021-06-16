const config = require('norska-config');
const assets = require('norska-assets');
const helper = require('norska-helper');
const imageProxy = require('norska-image-proxy');
const normalizeUrl = require('firost/normalizeUrl');
const path = require('path');
const _ = require('golgoth/lodash');
const fs = require('fs');
const isUrl = require('firost/isUrl');
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
    if (isUrl(target)) {
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
   * Wrapper around the image proxy, to automatically include the Cloudinary
   * bucket if one is defined
   * @param {string} url Image url
   * @param {object} userOptions Image proxy options
   * @returns {string} Full url with transforms applied
   **/
  imageProxy(url, userOptions = {}) {
    const options = this.imageProxyOptions(userOptions);
    return imageProxy(url, options);
  },
  imageProxyOptions(options = {}) {
    const cloudinary = config.get('cloudinary');
    if (!cloudinary) {
      return options;
    }
    return {
      ...options,
      cloudinary,
    };
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
    if (isUrl(target)) {
      return this.imageProxy(normalizeUrl(target), options);
    }

    // No proxy in development for local files
    if (!helper.isProduction()) {
      return this.pathFromFile(target, sourceFile);
    }

    const remoteUrl = this.remoteUrl(target, sourceFile);
    return this.imageProxy(remoteUrl, options);
  },
  /**
   * Returns the .full and .placeholder urls to be used for lazyloading
   *
   * |                    | Local image | Remote image |
   * | ------------------ | ----------- | ------------ |
   * | Dev (placeholder)  | base64 LQIP | proxy LQIP   |
   * | Dev (full)         | direct      | proxy        |
   * | Prod (placeholder) | base64 LQIP | proxy LQIP   |
   * | Prod (full)        | proxy       | proxy        |
   * | Disabled           | direct      | direct       |
   *
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
    let fullUrl = this.img(target, sourceFile, fullOptions);

    const isDisabled = _.get(options, 'disable', false);
    const isLocal = this.isLocal(target);

    // When disabled placeholder is the same as the full url
    if (isDisabled) {
      return {
        full: fullUrl,
        placeholder: fullUrl,
      };
    }

    // Placeholder of local images is a blurry base64 image
    // For remote images, it's going through the proxy
    let placeholderUrl;
    if (isLocal) {
      const runtimeKey = this.pathFromRoot(target, sourceFile);
      const { base64Lqip } = assets.readImageManifest(runtimeKey);
      placeholderUrl = base64Lqip;
    } else {
      const placeholderOptions = _.chain(options)
        .thru(this.imageProxyOptions)
        .omit(['disable'])
        .value();
      placeholderUrl = placeholderize(
        this.remoteUrl(target, sourceFile),
        placeholderOptions
      );
    }

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
    // Use the specified target if passed (local or remote), or use the current
    // url if not
    const urlTarget = target || sourceFile;
    const pageUrl = isUrl(urlTarget) ? urlTarget : this.pageUrl(urlTarget);

    const gitCommit = config.get('runtime.gitCommit');
    const revvedUrl = [
      'https://api.pixelastic.com/screenshots/',
      `revv:${gitCommit}/`,
      pageUrl.replace('://', '/').replace(/\?/g, '%3F').replace(/&/g, '%3D'),
    ].join('');

    // Pass through the image proxy
    const options = { width: 800 };
    return this.imageProxy(revvedUrl, options);
  },
  /**
   * Check if the given target is to a local file
   * @param {string} target URL or local path
   * @returns {boolean} True if a local file
   **/
  isLocal(target) {
    return !isUrl(target);
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
    if (isUrl(target)) {
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
  /**
   * Returns paths to a file either from the source directory or the theme
   * source directory
   * @param {string} relativePath Relative path from the source directory
   * @returns {string|boolean} Full path to the file, or false if not found
   */
  findFile(relativePath = '') {
    const fromPath = config.fromPath(relativePath);
    if (fs.existsSync(fromPath)) {
      return fromPath;
    }

    const themeFromPath = config.themeFromPath(relativePath);
    if (fs.existsSync(themeFromPath)) {
      return themeFromPath;
    }

    return false;
  },
};
