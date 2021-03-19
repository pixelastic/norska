---
title: Search theme
---

This theme allows you to quickly build a search interface to browse data pushed
to an Algolia index.

You can see examples on these fantasy [monsters][1] and [modules][2] searches.

## Installation

### Install the theme

To enable the theme, start by adding the theme to your dependencies:

```sh
yarn add norska-theme-search
```

### Set the theme in your config

Then, update your `norska.config.js`:

```js
const theme = require('norska-theme-search');
module.exports = {
  theme,
};
```

### Create a config file

Create a `_scripts/config.js` file in your source folder. This file should
contain at least a `credentials` and `widgets` keys.

```js
module.exports = {
  credentials: {
    appId: 'YOUR_APP_ID',
    apiKey: 'your_search_only_api_key',
    indexName: 'your_index_name',
  },
  // See documentation below for the widgets format
  widgets: [],
};
```

### Load it in your script.js

Load this file in your `script.js` file and pass it as an argument to
`theme.init`.

```js
// src/script.js
const theme = require('norska/theme');
const config = require('./_scripts/config.js');

(async () => {
  await theme.init(config);
})();
```

### Load it during static generation

Add a `_data/theme.js` file with the following content:

```js
module.exports = require('../_scripts/config.js');
```

This step is unfortunately currently required to allow both the server-side
generation and the runtime JavaScript to consume the same config. This part will
be automated in a future release.

## Widgets configuration

The default theme will add a search bar and display paginated results. To add
more filters to the sidebar, you need to configure the `widgets` key. The key
accepts an array of objects, that will be used to instanciate the final widgets.
The order of the array defines the order they are displayed in the sidebar.

```js
// Example of a widgets array
module.exports = {
  widgets: [
    {
      title: 'Author',
      defaultValue: ['Tim Carry'],
      options: {
        attribute: 'author',
      },
    },
    {
      title: 'Price',
      type: 'rangeSlider',
      hidden(data) {
        return data.meta.layout === 'no-price';
      },
      options: {
        attribute: 'price',
      },
    },
  ],
};
```

| Key            | Usage                                                                                                                                                                        | Default value    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `title`        | Title displayed in the sidebar                                                                                                                                               | N/A              |
| `type`         | Type of the widget. Can be passed either as a string, or a real widget                                                                                                       | `refinementList` |
| `options`      | Widget options to be passed to the widget                                                                                                                                    | `{}`             |
| `defaultValue` | Value(s) to be pre-filled on initial page load                                                                                                                               | N/A              |
| `hidden`       | If this method returns `true`, then the widget will not be added to the page. The method is called with the current `data` object used for rendering as its unique argument? | N/A              |

## Options

The `options` object passed to the call to `theme.init` accepts the following
keys.

| Key                | Usage                                                          | Default value         |
| ------------------ | -------------------------------------------------------------- | --------------------- |
| `credentials`      | `appId`, `apiKey` and `indexName` credentials to query Algolia | `{}`                  |
| `hitName`          | Name of the items to search, used in the `XXX items found`     | `item`                |
| `placeholder`      | Text displayed in the searchbar when query is empty            | `Search for anything` |
| `searchParamaters` | Optional `searchParameters` to pass                            | `{}`                  |
| `transforms`       | Object of transforms to apply to each hit                      | `{}`                  |
| `widgets`          | Array of additional InstantSearch widgets to add               | `[]`                  |

## Templates

The theme will look for specific template files in your `_includes/templates`
folder, and use them instead of its default implementation.

| Filepath                        | Usage                                         |
| ------------------------------- | --------------------------------------------- |
| `_includes/templates/hit.pug`   | Each hit returned by Algolia.                 |
| `_includes/templates/empty.pug` | Page to display when no results are matching. |
| `_includes/templates/logo.pug`  | Logo in the top left corner of the header.    |

Also note that the content of the layout will be added after the pagination.

## Styling

To change the styling of the default theme, you'll have to overwrite it. The
easiest way is to make your selectors more specific by prepending `body` to
them in your `style.css`.

```scss
@import 'theme:style.css';

body {
  .theme-header {
    @apply bg-black;
  }
  .theme-sidebar-title {
    @apply nodesto text-5 bg-black;
  }
  .theme-menu-icon:hover {
    @apply red-7;
  }

  /* Refinement List */
  .ais-RefinementList-label {
    &:hover {
      @apply red-7;
    }
  }
  .ais-RefinementList-item--selected {
    .ais-RefinementList-label {
      &:before {
        @apply bg-red-9;
      }
      &:after {
        @apply border-red-9;
      }
      &:hover {
        @apply red-9;
      }
    }
  }
  .ais-RefinementList-showMore {
    @apply red-9;
  }

  /* Range Slider */
  .ais-RangeSlider {
    .rheostat-progress,
    .rheostat-tooltip {
      @apply bg-red-9;
    }
    .rheostat-handle {
      @apply border-red-9;
      &:hover,
      &:active {
        @apply border-red-7;
        .rheostat-tooltip {
          @apply bg-red-7 white;
        }
      }
    }
  }
}
```

[1]: https://gamemaster.pixelastic.com/monsters/dnd/
[2]: https://gamemaster.pixelastic.com/society/
