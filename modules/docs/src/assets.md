---
title: Assets
---

All asset files (images, PDFs, fonts, etc) will be copied from `./src` to
`./dest` without any transformation.

## Filetypes

`norska` will not copy **all** files, only the ones it knows are static assets.

If you feel like it should copy a file but does not, you can update the
`assets.files` key in your `norska.config.js` file which is an array of glob
patterns.

By default it will copy the following files:

```js
{
  assets: {
    files: [
      // Static files
      '**/*.{html,txt}',
      // Images
      '**/*.{ico,jpg,jpeg,gif,png,svg}',
      // Fonts
      '**/*.{eot,otf,ttf,woff,woff2}',
      // Documents
      '**/*.pdf',
    ],
  }
}
```

## Revving

Asset files are not revved by default, even in production. They are only revved
if a clear reference to them is made from a Pug template, most commonly through
the `+img()` mixin.

In that case the original asset will be copied, but a revved version will also
be created and used by the `<img>` tag only.
