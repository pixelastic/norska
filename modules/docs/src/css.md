---
title: CSS
---

The `./src/style.css` file will be compiled through postCSS and made available
as `./dist/style.css`.

## Default plugins

For convenience, several postCSS plugins are automatically added.

### Tailwind CSS

This might be the most important plugin of all.
[Tailwind](https://tailwindcss.com/) is an incredible utility-first framework
that allows very quick designing in the browser.

`norska` comes bundled with it, as well as with a [custom
config](https://projects.pixelastic.com/tailwind-config-norska/) enabling much
more classes. You can also edit the `tailwind.config.js` file to add your own
configuration on top of it.

Most of the time, you won't need to edit any CSS files as you'll be able to
style things directly from the HTML. But in the rare cases you'll need it, you
can use the `@apply` from Tailwind in your CSS files.

```scss
.prose h1 a {
  @apply current-color;
}
```

### import

[postcss-import](https://github.com/postcss/postcss-import) allows using
`@import` to import import local files. 

A common pattern is to create a `./src/_styles` folder where you store your CSS
files and reference them through the
`./src/style.css` like this:

```css
@import 'theme:style.css';

@import './_styles/fonts.css';
@import './_styles/highlight.css';
```

_Note that the `theme:` syntax is a custom syntax to load CSS files from
themes._

### nested

[postcss-nested](https://github.com/postcss/postcss-nested) unwraps nested rules
in a fashion similar to what SCSS does.

```scss
// This...
.wrapper {
  .header {
    display: block;
  }
}
// ...will be converted to:
.wrapper .header {
  display: block;
}
```

## Production plugins

When running in production (through `yarn run build:prod`), additional plugins
are added.

### purgecss

[postcss-purgecss](https://github.com/FullHuman/postcss-purgecss) will remove
from the final CSS file all the classes that are not present in the HTML.

This is very important when using a framework like Tailwind because Tailwind
will by default generate a lot of classes (for each colors, breakpoints, etc).
By purging the CSS, we remove all the classes that are not used.

### autoprefixer

[postcss-autoprefixer](https://github.com/postcss/autoprefixer) will add all the
vendor prefixes needed for browser compatibility.

### clean

[postcss-clean](https://github.com/leodido/postcss-clean) will minify the final
CSS to reduce its size.


## Entrypoint

You can change the file to use as the entrypoint through the `css.input` key of
the `norska.config.js` file. Default is `style.css`.
