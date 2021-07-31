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

### Colors

The default theme is using green as its base color. To change the dominant
color(s), you can override some CSS classes in your `style.css` file.

```scss
@import 'theme:style.css';

body {
  /* Change the header background color */
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

To change the logo of the website, create a `./src/assets/logo.svg` file. This
will be used as both the logo in the header, and the favicon.

You can also create a `./src/_includes/logo.pug` to overwrite the logo displayed
in the header. By default it tries to adapt to screen sizes by hiding the
project title and only keeping the logo on small screens, but depending on your
logo/title, you might have to adjust it. Have a look [at the theme file][1] for
inspiration.

[The noun project][4] is a great ressource for finding simple SVG icons to use,
and [this CodePen][5] can help in removing the whitespace around the actual
icon.

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

To add [DocSearch][2] to your documentation, start
by [applying through this form][3].

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

[1]: https://github.com/pixelastic/norska-theme-docs/blob/master/src/_includes/logo.pug
[2]: https://docsearch.algolia.com/
[3]: https://docsearch.algolia.com/apply/
[4]: https://thenounproject.com/
[5]: https://codepen.io/mkmueller/pen/vpJmEK
