module.exports = {
  parseNavigationLink(link, isCurrentPage) {
    const href = link.href || `/${link}/`;
    const title = link.title || link;
    const css = isCurrentPage(href)
      ? 'DocSearch-active border-green-4 bold'
      : 'border-transparent hover_border-gray-4';
    return { href, title, css };
  },
};
