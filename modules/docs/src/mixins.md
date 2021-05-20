---
title: Mixins
---

Any `.pug` file (including layouts), will come bundled with a few mixins to make
development easier, but you can also add your own.

## Default mixins

### img(urlOrPath, \[options])

This mixin is very powerful and should be used in place of the regular `img`
tag. It will automatically pass the target url through an image CDN and lazyload
it.

Any target path starting with `/` is interpreted as being relative to the
website root. Any other relative path is interpreted as relative to the file
calling it. Any remote url (starting with `http(s)://`), is always handled as
a remote resource.

### norska\_head

This mixin is meant to be used as part of a layout and will render the whole
`<head>` tag.

It will set all the basic HTML meta tags including `<title>` and `<meta
name="description">` as well as the OpenGraph ones. All data will be read from the pages frontmatter, or fallback to anything
defined in `./src/_data/meta.json`.

Additionally, it will define the favicon and load the CSS file.

You can pass additional custom elements by filling the mixin block like this:

```pug
+norska_head
  link(rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@alpha")
```

### norska\_scripts

This mixin is meant to be used as part of a layout and will add all the required
`<script>` tags.

By default webpack splits all vendor dependencies into its own file and any
custom script into another. This will make sure to load all the required webpack
bundles correctly.

You can pass additional custom scripts by filling the mixin block like this:

```pug
+norska_scripts
  script(src="https://cdn.jsdelivr.net/npm/@docsearch/js@alpha")
```

## Custom mixins

You can add your own mixins by creating a file named
`./src/_includes/mixins.pug` and adding them there. They will be automatically
added to the top of each file.
