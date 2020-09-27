---
title: norska build
---

The `norska build` command will build the website. This means converting all
source files in `./src` into final compiled files in `./dist`.

The command is aliased to `yarn run build` for convenience.

## Types of files

`.pug` and `.md` files will be converted to HTML.

`style.css` will be processed by PostCSS and `script.js` by Webpack.

All static assets (images, fonts, etc) will be copied to `./dist`.

## Building for production

When running `yarn run build:prod`, a few more steps are added to the build, to
generate an optimized version. This is the command run when deploying on
Netlify.

Assets are _revved_. This means that a hash is added to their name.
`./src/assets/image.png` will become `./dist/assets/image.h4sh.png` for example.
The hash is generated from the file content, so whenever the file changes, its
hash will change as well. This is a great way to bypass browser caching:
whenever you update an asset, its url is changing.

The generated CSS file is purged, prefixed and compressed This means that only
CSS classes that are actually used in the markup are kept, then vendor-specific
prefixes are added, and the whole file is compressed.

## On Netlify

This command is smart enough to know if it's running as part of a Netlify build
or locally while developing.

When running on Netlify, it will cancel the build early if it detects that no
relevant changes where made since the last deploy. This works by checking the
git history since the last deploy and only proceed with the build if files in
`./src` where changed.

See the [Netlify](/netlify/) section for more information.
