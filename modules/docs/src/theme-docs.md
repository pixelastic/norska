---
title: Documentation theme
---

The official documentation theme for norska is named `norska-theme-docs` and is
the one you see on this very website.

## Installation

To enable the theme, start by adding the theme to your dependencies:

```sh
yarn add norska-theme-docs
```

Then, update your `norska.config.js`:

```js
const theme = require('norska-theme-docs');
module.exports = {
  theme,
};
```

All your pages should now be served with this theme.

_⚠ Note that the plugin expect your repository to follow a mono-repo setup with
your module code in `./lib` and the documentation website in `./docs`._

## Configuration

Now, let's see how to tweak the theme to make it fit your project.

### Meta

Open `./src/_data/meta.json` and edit the data that defines your project.

### Sidebar

Create a `./src/_data/theme.js` file to define the links of your sidebar. The
`navigation` key expect an array of objects, where each object represents
a section of the sidebar.

Each section must have a `name` string and `links` array. Each link is an object
with a `title` and an `href` key. Each link can optionnally have its own `links`
key for a nested section.

```js
module.exports = {
  navigation: [
    {
      name: 'Overiew',
      links: [
        {
          title: 'Installation',
          href: 'installation',
        },
        {
          title: 'Changelog',
          href: 'changelog',
          links: [
            {
              title: 'v1.1',
              href: 'changelog-1.1',
            },
            {
              title: 'v1.0',
              href: 'changelog-1.0',
            },
          ],
        },
      ],
    },
    {
      name: 'Configuration',
      links: [
        {
          title: 'Options',
          href: 'options',
        },
        {
          title: 'Command-line',
          href: 'cli',
        },
      ],
    },
  ],
};
```

### DocSearch

To add [DocSearch](https://docsearch.algolia.com/) to your documentation, start
by [applying through this form](https://docsearch.algolia.com/apply/). 

You'll receive an `apiKey` and `indexName` by email. Add them to your
`_data/theme.json` config file, under the `docSearch` key like this:

```json
{
  [...],
  "docSearch": {
    "apiKey": "YOUR_API_KEY",
    "indexName": "YOUR_INDEX_NAME"
  }
}
```

### Colors

The default theme is using green as its base color. To change the dominant
color(s), you can override some CSS classes in your `style.css` file.

```scss
@import 'theme:style.css';

body {
  /* Change the header backround color */
  .theme-header {
    @apply bg-blue-1;
  }
  /* Change the current page marker color in the sidebar */
  .theme-navigation-link-active {
    @apply border-blue-4;
  }
  /* Change the color of links on hover in the sidebar */
  .theme-navigation-link:hover {
    @apply blue-5;
  }
  /* Change the color of the title underline */
  .theme-title {
    @apply border-blue-5;
  }

  /* DocSearch main color */
  --docsearch-primary-color: #4299e1;
}
.prose a {
  /* Change the color of links */
  @apply blue-5;
  &:hover {
    /* Change the color of the underline of hovered links */
    @apply underline-blue-5;
  }
}
```

### Logos

The logo displayed in the header can be configured by creating the files
`./src/_includes/logo.pug`, `./src/_includes/logo_md.pug` and
`./src/_includes/logo_lg.pug`. The `_md` and `_lg` variant represent the logo to
be displayed on medium and large viewports, respectively.


