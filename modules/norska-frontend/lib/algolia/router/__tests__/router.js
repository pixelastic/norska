const module = require('../index.js');
const helper = require('../helper.js');
const credentials = require('../../credentials.js');

describe('router', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'currentUrl').mockReturnValue('monsters.com/search/');
    jest.spyOn(credentials, 'indexName').mockReturnValue('baseIndex');
  });
  const testCases = [
    // locationHash | routeState
    ['', { baseIndex: {} }],
    ['#query:foo', { baseIndex: { query: 'foo' } }],
    ['#query:foo%20bar', { baseIndex: { query: 'foo bar' } }],
    ['#page:12', { baseIndex: { page: '12' } }],
    ['#page:12/query:foo', { baseIndex: { query: 'foo', page: '12' } }],
    [
      '#type:[bar,foo]',
      { baseIndex: { refinementList: { type: ['bar', 'foo'] } } },
    ],
    [
      '#type:[Chaotic%20Good,Loyal%20Neutral]',
      {
        baseIndex: {
          refinementList: { type: ['Chaotic Good', 'Loyal Neutral'] },
        },
      },
    ],
    [
      '#tag:[bar,baz]/type:[bar,foo]',
      {
        baseIndex: {
          refinementList: { type: ['bar', 'foo'], tag: ['bar', 'baz'] },
        },
      },
    ],
    ['#price:{0,1200}', { baseIndex: { range: { price: '0:1200' } } }],
    ['#price:{0,}', { baseIndex: { range: { price: '0:' } } }],
    ['#price:{,1200}', { baseIndex: { range: { price: ':1200' } } }],
    [
      '#query:foo/sortBy:popularity',
      { baseIndex: { query: 'foo', sortBy: 'baseIndex_popularity' } },
    ],
    [
      '#index:other_index/query:foo',
      { baseIndex: { query: 'foo', sortBy: 'other_index' } },
    ],
  ];
  it.each(testCases)("parseURL('%s')", async (locationHash, routeState) => {
    const actualIndexRouteState = module.parseURL({
      location: { hash: locationHash },
    });
    expect(actualIndexRouteState).toEqual(expect.objectContaining(routeState));
  });
  it.each(testCases)(
    "createURL({...}) == '%s'",
    async (locationHash, routeState) => {
      const actualLocation = module.createURL({ routeState });
      expect(actualLocation).toEqual(`monsters.com/search/${locationHash}`);
    }
  );
});
