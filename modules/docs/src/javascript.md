---
title: JavaScript
---

The `./src/script.js` file will be compiled through Webpack. 

## In production

In production, the final code will be split into two files: one for all the
vendor dependencies, and one for this website-specific code.

Doing so allows for faster loading both in dev and in prod as you won't change
your dependencies as often as your custom code, so only one file needs to be
downloaded/generated again.

Filenames will also be revved, so any change to the content of either file will
be available on a new url; bypassing any cache.

## Entrypoint

You can change the file to use as the entrypoint through the `js.input` key of
the `norska.config.js` file. Default is `script.js`.

## Custom layouts

If you're creating your own custom layout, you should use the
[norska_scripts](/mixins/#norskascripts) mixin to properly include all the
needed files to your HTML.
