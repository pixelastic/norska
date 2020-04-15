const proxy = require('../cloudinary/proxy');
module.exports = function(url) {
  const options = {
    width: '50%',
    height: '50%',
    quality: 10,
  };
  return proxy(url, options);
};
