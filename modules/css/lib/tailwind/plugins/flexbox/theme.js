module.exports = {
  // FLEX CONTAINERS
  // FLex Row No Wrap
  '.flrnw': {
    display: 'flex',
    flexDirection: 'row',
  },
  // Flex Row Wrap
  '.flrw': {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // FLex Column No Wrap
  '.flcnw': {
    display: 'flex',
    flexDirection: 'column',
  },
  // FLex Column Wrap
  '.flcw': {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  // Row No Wrap (Useful when changing the display dynamically)
  '.rnw': {
    flexDirection: 'row',
  },
  // Row Wrap
  '.rw': {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Column No Wrap
  '.cnw': {
    flexDirection: 'column',
  },
  // Column Wrap
  '.cw': {
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  // FLex Column Center Vertically
  '.flccv': {
    justifyContent: 'center',
  },
  // FLex Column Center Horizontally
  '.flcch': {
    alignItems: 'center',
  },
  // FLex Row Center Vertically
  '.flrcv': {
    alignItems: 'center',
  },
  // FLex Row Center Horizontally
  '.flrch': {
    justifyContent: 'center',
  },
  // Flex Center (center both horizontally and vertically)
  '.flc': {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // FLex Row Align Left
  '.flral': {
    justifyContent: 'flex-start',
  },
  // FLex Row Align Right
  '.flrar': {
    justifyContent: 'flex-end',
  },
  // FLex Column Align Top
  '.flcat': {
    justifyContent: 'flex-start',
  },
  // FLex Column Align Bottom
  '.flcab': {
    justifyContent: 'flex-end',
  },
  // FLex SPace Around
  '.flspa': {
    justifyContent: 'space-around',
  },
  // FLex SPace Between
  '.flspb': {
    justifyContent: 'space-between',
  },
  // FLEX ITEMS
  // FLex None (to be used when specifying a dimension)
  '.fln': {
    flex: 'none',
  },
  // Flex Auto (to use all the available space)
  '.fla': {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
  },
};
