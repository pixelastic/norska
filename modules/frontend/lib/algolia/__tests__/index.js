const current = require('../index');
const widgets = require('../widgets');

describe('norska-frontend > algolia', () => {
  describe('hasContainer', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__documentQuerySelector').mockReturnValue(true);
    });
    it('should return false if no option key', async () => {
      const input = {
        type: widgets.searchBox,
      };
      const actual = current.hasContainer(input);
      expect(actual).toEqual(false);
    });
    it('should return false if no option.container key', async () => {
      const input = {
        type: widgets.searchBox,
        options: {},
      };
      const actual = current.hasContainer(input);
      expect(actual).toEqual(false);
    });
    it('should return false if no DOM element matching', async () => {
      jest.spyOn(current, '__documentQuerySelector').mockReturnValue(false);
      const input = {
        type: widgets.searchBox,
        options: {
          container: '#something-not-here',
        },
      };
      const actual = current.hasContainer(input);
      expect(actual).toEqual(false);
    });
    it('should return true if DOM element matching', async () => {
      const input = {
        type: widgets.searchBox,
        options: {
          container: '#something',
        },
      };
      const actual = current.hasContainer(input);
      expect(actual).toEqual(true);
    });
    it('should always return true for configure widget', async () => {
      const input = {
        type: widgets.configure,
        options: {
          hitsPerPage: 24,
        },
      };
      const actual = current.hasContainer(input);
      expect(actual).toEqual(true);
    });
  });
});
