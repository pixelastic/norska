---
title: Layouts
---

By default, all files inherit from the default layout bundled with `norska`.

## Overriding the default layout

You can create your own custom layout by creating the
`./src/_includes/layout/default.pug` file. Any layout saved in
`./src/_includes/layouts` will always take precedence over layouts coming from
themes.

The minimum required for the layout to work is to have a block named `content`.
This block will be replaced with the content of each page.

```pug
//- Example of a basic layout
doctype html
html(lang='en')
  +norska_head()
  body
    block content
    +norska_scripts()
```

The `norska_head()` and `norska_scripts()` mixins are useful helpers to
automatically include the requires CSS/JavaScript files and `<meta>` tags.

## Changing the layout of a specific page

You can also create multiple layouts in `./src/_includes/layouts` and reference
them from the frontmatter of your page.

For example, if you have a `./src/_includes/layouts/blog.pug` layout, you can
use it on a specific page by adding `layout: blog` to its frontmatter.

## Using a layout from a theme

Themes also provide an easy way to change the whole layout of a website. For
that, you need to pass the theme to the `norska.config.js` file.

```js
const theme = require('norska-theme-docs');
module.exports = {
  theme,
};
```

This will change the default layout for all pages of the website. Check the
documentation of each theme to see if they have any additional configuration.
