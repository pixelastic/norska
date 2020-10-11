const height = require('../height.js');
const minHeight = require('../minHeight.js');
const maxHeight = require('../maxHeight.js');
const _ = require('golgoth/lib/lodash');
const chValue = expect.stringMatching(/ch$/);

describe('dimensions', () => {
  let theme;
  describe('height', () => {
    beforeEach(async () => {
      theme = height;
    });
    it('should not have any values in ch', async () => {
      expect(_.values(theme)).not.toContainEqual(chValue);
    });
  });
  describe('maxHeight', () => {
    beforeEach(async () => {
      theme = maxHeight;
    });
    it('should not have any values in ch', async () => {
      expect(_.values(theme)).not.toContainEqual(chValue);
    });
  });
  describe('minHeight', () => {
    beforeEach(async () => {
      theme = minHeight;
    });
    it('should not have any values in ch', async () => {
      expect(_.values(theme)).not.toContainEqual(chValue);
    });
  });
});
