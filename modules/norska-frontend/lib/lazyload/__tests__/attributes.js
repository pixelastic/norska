const module = require('../attributes');
const placeholderize = require('../placeholderize');
const proxy = require('../../cloudinary/proxy');
jest.mock('../placeholderize');
jest.mock('../../cloudinary/proxy');

describe('norska-frontend > lazyload > attributes', () => {
  beforeEach(async () => {
    placeholderize.mockReturnValue('__PLACEHOLDER__');
    proxy.mockReturnValue('__PROXY__');
  });
  it('should return full and placeholder', async () => {
    const actual = module('url');
    expect(actual).toHaveProperty('full', '__PROXY__');
    expect(actual).toHaveProperty('placeholder', '__PLACEHOLDER__');
  });
  it('should return both full if disabled', async () => {
    const actual = module('url', { disable: true });
    expect(actual).toHaveProperty('full', '__PROXY__');
    expect(actual).toHaveProperty('placeholder', '__PROXY__');
  });
});
