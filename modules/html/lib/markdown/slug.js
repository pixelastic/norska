const slug = require('slug');
slug.extend({ '♥': 'love' });

/**
 * Sluggify a string
 * This is just a wrapper around the slug module, but we put it in its own file
 * so we can define custom symbol=>text mapping
 **/
module.exports = slug;
