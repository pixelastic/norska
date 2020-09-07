const current = require('../parseNavigationLink');
const _ = require('golgoth/lib/lodash');

describe('norska-theme-docs > parseNavigationLink', () => {
  const dependencyInjection = {
    link: jest.fn(),
    isCurrentPage: jest.fn(),
  };
  beforeEach(async () => {
    dependencyInjection.link.mockImplementation((input) => {
      return `link:${input}`;
    });
    dependencyInjection.isCurrentPage.mockImplementation((input) => {
      return `isCurrentPage:${input}`;
    });
  });
  it.each([
    [
      'Object notation',
      {
        title: 'Getting Started',
        href: 'gettingStarted',
      },
      {
        title: 'Getting Started',
        relativeLink: 'link:/gettingStarted',
        isActive: 'isCurrentPage:/gettingStarted',
      },
    ],
    [
      'Shorthand notation',
      'emptyDir',
      {
        title: 'emptyDir',
        relativeLink: 'link:/emptyDir',
        isActive: 'isCurrentPage:/emptyDir',
      },
    ],
  ])('%s', async (_name, input, expected) => {
    const actual = current(input, dependencyInjection);
    _.each(expected, (value, key) => {
      expect(actual).toHaveProperty(key, value);
    });
  });
});
