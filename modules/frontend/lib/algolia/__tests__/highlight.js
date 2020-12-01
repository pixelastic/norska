const current = require('../highlight');

describe('norska-frontend > algolia > highlight', () => {
  it.each([
    ['No higlight key', { name: 'Abadar' }, 'name', 'Abadar'],
    [
      'Key is highlighted',
      {
        name: 'Abadar',
        _highlightResult: {
          name: {
            value: '<mark>Aba</mark>dar',
          },
        },
      },
      'name',
      '<mark class="ais-highlight">Aba</mark>dar',
    ],
    [
      'Key to highlight is an array',
      {
        domains: ['Madness', 'Trickery'],
        _highlightResult: {
          domains: [{ value: 'Madness' }, { value: '<mark>Tri</mark>ckery' }],
        },
      },
      'domains',
      ['Madness', '<mark class="ais-highlight">Tri</mark>ckery'],
    ],
    [
      'Key to highlight is an object',
      {
        country: {
          name: 'France',
          otherNames: ['Francia', 'Frankreich'],
          city: {
            name: 'Franconville',
          },
        },
        _highlightResult: {
          country: {
            name: {
              value: '<mark>Fra</mark>nce',
            },
            otherNames: [
              { value: '<mark>Fra</mark>ncia' },
              { value: '<mark>Fra</mark>nkreich' },
            ],
            city: {
              name: {
                value: '<mark>Fra</mark>nconville',
              },
            },
          },
        },
      },
      'country',
      {
        name: '<mark class="ais-highlight">Fra</mark>nce',
        otherNames: [
          '<mark class="ais-highlight">Fra</mark>ncia',
          '<mark class="ais-highlight">Fra</mark>nkreich',
        ],
        city: {
          name: '<mark class="ais-highlight">Fra</mark>nconville',
        },
      },
    ],
    [
      'Key also has a snippet',
      {
        description: 'Abadar, the god of cities, law, merchants and wealth.',
        _highlightResult: {
          description: {
            value:
              '<mark>Aba</mark>dar, the god of cities, law, merchants and wealth.',
          },
        },
        _snippetResult: {
          description: {
            value: '<mark>Aba</mark>dar, the god of cities',
          },
        },
      },
      'description',
      '<mark class="ais-highlight">Aba</mark>dar, the god of cities',
    ],
  ])('%s', async (_title, item, key, expected) => {
    const actual = current(item, key);
    expect(actual).toEqual(expected);
  });
});
