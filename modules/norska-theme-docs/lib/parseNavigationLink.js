/**
 * Parses a navigation entry into .href, .title and .isActive
 * @param {string|object} entry Link object or string shorthand
 * @param {object} dependencyInjection Object containing pug methods
 * Expect isCurrentPage and link
 * @returns {object} Object with all parsed information
 **/
module.exports = (entry, dependencyInjection = {}) => {
  const { isCurrentPage, link } = dependencyInjection;

  const title = entry.title || entry;

  // href is expected to be given as relative to the root, but will be returned
  // as relative to the file calling it
  let href = entry.href || entry;
  if (!href.startsWith('/')) {
    href = `/${href}`;
  }
  const relativeLink = link(href);

  const isActive = isCurrentPage(href);
  return { title, relativeLink, isActive };
};
