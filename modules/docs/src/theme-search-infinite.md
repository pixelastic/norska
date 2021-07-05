---
title: Infinite search theme
---

This theme allows you to quickly build an infinite list of Algolia search
results, displayed as a Pinterest-like wall.

You can see examples on these fantasy [maps][1] and [pantheon][2] searches.

## Installation

To enable the theme, start by adding the theme to your dependencies:

```sh
yarn add norska-theme-search-infinite
```

Then, update your `norska.config.js`:

```js
const theme = require('norska-theme-search-infinite');
module.exports = {
  theme,
};
```

You'll also need to add a `_data/config.js` file with your Algolia credentials:

```js
module.exports = {
  algolia: {
    appId: 'YOUR_APP_ID',
    apiKey: 'your_search_only_api_key',
    indexName: 'your_index_name',
  },
};
```
## Options

You can pass an `options` object to the call to `theme.init` in your `script.js`
file.

| Key           | Usage                                                        | Default value         |
| ------------- | ------------------------------------------------------------ | --------------------- |
| `placeholder` | Text displayed in the searchbar when query is empty          | `Search for anything` |
| `hitName`     | Name of the items to search. Used in "XXX {hitName}s found". | `item`                |
| `transforms`  | Object of transforms to apply to each hit                    | `{}`                  |
| `widgets`     | Array of additional InstantSearch widgets to add             | `[]`                  |

## Templates

The theme will look for specific template files in your `_includes/templates`
folder, and use them instead of its default implementation.

| Filepath                          | Usage                                                            |
| --------------------------------- | ---------------------------------------------------------------- |
| `_includes/templates/hit.pug`     | Each hit returned by Algolia.                                    |
| `_includes/templates/filters.pug` | Content of the modal displayed when clicking on the sliders icon |
| `_includes/templates/footer.pug`  | Appended at the end of the page, after all the results.          |

Also note that the content of the layout will be added between the search bar
and the hits.

If your hit template contains an image, you should add the class
`js-masonryImage` to it so the theme correctly resize the brick once the image
is loaded.

## Styling

To change the styling of the default theme, you'll have to overwrite it. The
easiest way is to make your selectors more specific by prepending `html` to
them in your `style.css`.

```scss
@import 'theme:style.css';

html {
  /* Set the global background color */
  .bg-theme {
    @apply bg-indigo-8;
  }
  /* Minimum card width */
  .js-masonryWall {
    @apply grid-cols-w-16;
  }
  /* Effect on hover of a card */
  .js-masonryBrick:hover {
    @apply bg-purple-1;
  }
  /* Highlighted text */
  .ais-highlight {
    @apply indigo;
  }
}
```

[1]: https://gamemaster.pixelastic.com/maps/
[2]: https://gamemaster.pixelastic.com/gods/
