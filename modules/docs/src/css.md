---
title: CSS
---

The `./src/style.css` file will be compiled through postCSS and made available
as `./dist/style.css`.

The default `style.css` created by `norska init` only contains one line
(`@import 'theme:style.css';`). This line is very important and includes the
default CSS file from your current theme (which in turn will include Tailwind).

You can add your own custom CSS to the `style.css` file. A recommended approach
is the following:

```css
/* Don't remove this line */
@import 'theme:style.css';

/* You can add your custom CSS below */

/* You can @import local files to better organize your CSS */
@import "_styles/fonts.css";
@import "_styles/header.css";
@import "_styles/videos.css";
@import "_styles/footer.css";

/* Or add it directly here. All Tailwind classes are available through @apply */
.prose a {
  @apply blue-5;
  &:hover {
    @apply underline-blue-5;
  }
}
```

## Entrypoint

You can change the file to use as the entrypoint through the `css.input` key of
the `norska.config.js` file. Default is `style.css`.
