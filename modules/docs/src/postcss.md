---
title: PostCSS plugins
---

For convenience, several postCSS plugins are automatically added.

### Tailwind CSS

This might be the most important plugin of all. [Tailwind][1] is an incredible
utility-first framework that allows very quick designing in the browser.

`norska` comes bundled with it, and extends it with [its own custom
config][2]. You can also edit the `tailwind.config.js` file to add your own
configuration on top of it.

Most of the time, you won't need to edit any CSS files as you'll be able to
style things directly from the HTML. But in the rare cases you'll need it, you
can use the `@apply` from Tailwind in your CSS files.

```scss
.prose h1 a {
  @apply bg-red;
}
```

### Import

[postcss-import][3] allows using `@import` to import import local files.

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

### Nested

[postcss-nested][4] unwraps nested rules
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

When running in production (through `yarn run build:prod`),
[cssnano][5] is called as well. It will minify the output, and
add the required vendor prefixes.

[1]: https://tailwindcss.com/
[2]: /tailwind/
[3]: https://github.com/postcss/postcss-import
[4]: https://github.com/postcss/postcss-nested
[5]: https://cssnano.co/
