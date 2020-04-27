const module = require('../index.js');
const helper = require('../helper.js');
const credentials = require('../../credentials.js');

describe('router', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'currentUrl').mockReturnValue('monsters.com/search/');
    jest.spyOn(credentials, 'indexName').mockReturnValue('indexName');
  });
  const testCases = [
    // indexRouteState | location | options
    [{}, ''],
    [{ query: 'foo' }, '#query:foo'],
    [{ query: 'foo bar' }, '#query:foo%20bar'],
    [{ page: '12' }, '#page:12'],
    [{ query: 'foo', page: '12' }, '#page:12/query:foo'],
    [{ refinementList: { type: ['bar', 'foo'] } }, '#type:[bar,foo]'],
    [
      { refinementList: { type: ['Chaotic Good', 'Loyal Neutral'] } },
      '#type:[Chaotic%20Good,Loyal%20Neutral]',
    ],
    [
      { refinementList: { type: ['bar', 'foo'], tag: ['bar', 'baz'] } },
      '#tag:[bar,baz]/type:[bar,foo]',
    ],
    [{ range: { price: '0:1200' } }, '#price:{0,1200}'],
    [{ range: { price: '0:' } }, '#price:{0,}'],
    [{ range: { price: ':1200' } }, '#price:{,1200}'],
  ];

  it.each(testCases)(
    "%s == parseURL('%s')",
    async (indexRouteState, locationHash) => {
      const actualIndexRouteState = module.parseURL({
        location: { hash: locationHash },
      });
      expect(actualIndexRouteState).toEqual({
        indexName: expect.objectContaining(indexRouteState),
      });
    }
  );
  it.each(testCases)(
    'createURL(%s) == %s',
    async (indexRouteState, locationHash) => {
      const actualLocation = module.createURL({
        routeState: { indexName: indexRouteState },
      });
      expect(actualLocation).toEqual(`monsters.com/search/${locationHash}`);
    }
  );
});
