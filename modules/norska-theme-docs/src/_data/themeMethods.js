module.exports = {
  parseNavigationLink(entry, dependencyInjection = {}) {
    const { isCurrentPage, link } = dependencyInjection;
    const href = entry.href || link(`/${entry}/`);
    const title = entry.title || entry;
    const css = isCurrentPage(href)
      ? 'DocSearch-active border-green-4 bold'
      : 'border-transparent hover_border-gray-4';
    return { href, title, css };
  },
};
