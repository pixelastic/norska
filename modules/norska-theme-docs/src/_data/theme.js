const read = require('firost/read');
const path = require('path');

module.exports = async () => {
  const instructions = await read(path.resolve(__dirname, './instructions.md'));
  return {
    isDefaultInstall: true,
    instructions,
    navigation: [
      {
        name: 'Section 1',
        links: [
          {
            title: 'Link 1',
            href: '#',
          },
          {
            title: 'Link 2',
            href: '#',
          },
          {
            title: 'Link 3',
            href: '#',
          },
        ],
      },
      {
        name: 'Section 1',
        links: [
          {
            title: 'Link 1',
            href: '#',
          },
          {
            title: 'Link 2',
            href: '#',
          },
          {
            title: 'Link 3',
            href: '#',
          },
        ],
      },
    ],
  };
};
