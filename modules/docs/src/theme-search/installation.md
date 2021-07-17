---
title: Installation
---

Add it to your `dependencies`:

```sh
yarn add norska-theme-search
```

Set it as the default theme in your `norska.config.js`:

```js
const theme = require('norska-theme-search');
module.exports = {
  theme,
};
```

Create a `src/_scripts/config.js` file. This will contain all the Algolia
configuration. It will be shared between the build process (to generate the
HTML) and the browser (to bind all events together). See the [Configuration
page](./configuration) for the complete list of available options.

```js
module.exports = {
  credentials: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_SEARCH_ONLY_API_KEY',
    indexName: 'YOUR_INDEX_NAME',
  }
};
```

Update your `src/script.js` to init the theme with your configuration.

```js
const theme = require('norska/theme');
const config = require('./_scripts/config.js');

(async () => {
  await theme.init(config);
})();
```

Add a `src/_data/theme.js` that will serve as a proxy for the build process.

```js
module.exports = require('../_scripts/config.js');
```
