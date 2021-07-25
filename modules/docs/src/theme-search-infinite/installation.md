---
title: Installation
---

Add it to your `dependencies`:

```sh
yarn add norska-theme-search-infinite
```

Set it as the default theme in your `norska.config.js`:

```js
const theme = require('norska-theme-search-infinite');
module.exports = {
  theme,
};
```

Create a `src/_data/config.` file with your Algolia credentials.

```js
module.exports = {
  algolia: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_SEARCH_ONLY_API_KEY',
    indexName: 'YOUR_INDEX_NAME',
  },
};
```
