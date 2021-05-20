---
title: norska init
---

The `yarn run norska init` command should be the first command you'd run. It
will scaffold your project, creating all the needed files and configuring any
service it might use.

You should never need to run this command more than once.

## The `./src` folder

It create a `./src` folder with all the files needed to generate your website.
We call this directory the **source** folder.

You can see that it contains a default `index.pug` file as well as a `404.md`
page. All `.pug` and `.md` files will be converted to HTML.

The `script.js` file is the default JavaScript file included on all pages, and
it will activate the lazyloading of any image in the page by default.

The `style.css` file loads the default CSS rules of the page (mostly loading
Tailwind), but you can add you own rules inside as well.

The `_data/meta.json` file contains default information about your website (like
title, description, author, etc). Those values will be used to populate the
`<head>` default meta information.

A default `favicon.ico` is added because most browsers still look for one, not
matter what you define in your `<head>`

## Custom scripts

A set of new scripts have been added to your `package.json`. They all target
files created in `./scripts` mirrorring their name.

This means that `yarn run serve` will call `./scripts/serve` and `yarn run
build` will run `./scripts/build` for example.
