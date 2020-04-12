const module = require('../index.js');
const helper = require('../helper.js');

describe('router', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'currentUrl').mockReturnValue('monsters.com/search/');
    jest.spyOn(helper, 'indexName').mockReturnValue('indexName');
  });
  it.each([
    // indexRouteState | location | options
    [{}, ''],
    [{ query: 'foo' }, '#query:foo'],
    [{ page: 12 }, '#page:12'],
    [{ query: 'foo', page: 12 }, '#page:12/query:foo'],
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
  ])('%s <=> #%s (%s)', async (indexRouteState, locationHash) => {
    const actualIndexRouteState = module.parseURL({
      location: { hash: locationHash },
    });
    expect(actualIndexRouteState).toEqual({
      indexName: expect.objectContaining(indexRouteState),
    });

    const actualLocation = module.createURL({
      routeState: { indexName: indexRouteState },
    });
    expect(actualLocation).toEqual(`monsters.com/search/${locationHash}`);
  });
});
