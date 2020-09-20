const current = require('../hexToRGB');

describe('hexToRGB', () => {
  describe('should convert colors', () => {
    it.each([
      ['#000000', { red: 0, green: 0, blue: 0 }],
      ['#FF0000', { red: 255, green: 0, blue: 0 }],
      ['#00FF00', { red: 0, green: 255, blue: 0 }],
      ['#0000FF', { red: 0, green: 0, blue: 255 }],
      ['#000', { red: 0, green: 0, blue: 0 }],
      ['black', false],
      ['transparent', false],
    ])('%s', async (input, expected) => {
      const actual = current(input);
      expect(actual).toEqual(expected);
    });
  });
});
