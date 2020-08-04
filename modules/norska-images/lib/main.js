/**
 * Pass an image url through the image proxy
 * @param {string} userUrl Image url
 * @param {object} userOptions Options to transform the image
 * - width {number}
 *   Resize image to this width
 *   Can be either a number of pixels, or a ratio (number between 0 and 1)
 * - height {number}
 *   Resize image to this height
 *   Can be either a number of pixels, or a ratio (number between 0 and 1)
 * - quality {number}
 *   Reduce quality of the image, for smaller size
 *   Should be a number between 1 (lowest quality) and 100 (highest quality)
 * - blur {number}
 *   Apply a blur effect on the image
 *   Should be a number between 1 and 2000
 * - grayscale {boolean}
 *   Pass the image in shades of gray
 *
 *  @returns {string} Full url with transforms applied
 **/
module.exports = function (userUrl, userOptions = {}) {
  const baseUrl = 'https://images.weserv.nl';
  // Fail fast and do nothing if url is already through an image proxy
  const isAlreadyProxyfied = userUrl.startsWith(baseUrl);
  if (isAlreadyProxyfied) {
    return userUrl;
  }

  // Throw an error if not a remote url
  const isRemote = userUrl.startsWith('http');
  if (!isRemote) {
    const error = new Error(`URL ${userUrl} is not valid`);
    error.code = 'IMAGE_PROXY_NOT_URL';
    throw error;
  }
  const originUrl = encodeURIComponent(userUrl);

  const options = {
    compressPng: true,
    progressive: true,
    ...userOptions,
  };

  const availableOptions = {
    blur: 'blur',
    compressPng: 'af',
    grayscale: 'filt=greyscale',
    height: 'h',
    progressive: 'il',
    quality: 'q',
    width: 'w',
  };

  const parsedOptions = Object.keys(options)
    .map((key) => {
      const prefix = availableOptions[key];
      if (!prefix) {
        return false;
      }
      const value = options[key];
      // If the value is "true", we simply add the prefix
      if (value === true) {
        return prefix;
      }
      return `${prefix}=${value}`;
    })
    .filter(Boolean);
  parsedOptions.sort();
  const optionsAsString = parsedOptions.length ? parsedOptions.join('&') : '';

  return `${baseUrl}?url=${originUrl}&${optionsAsString}`;
};
