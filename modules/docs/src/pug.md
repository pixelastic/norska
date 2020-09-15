---
title: Pug
---

All `.pug` files in `./src` will be converted to matching `.html` files in
`./dist`.


## Frontmatter

Each `.pug` file can start with a custom frontmatter block. Such blocks are
comments delimited by `//- ---` and contains key/values pairs of data that will
be forwarded to the Pug rendering engine.

You can use this block to change some of the page metadata, like its `title` or
`description`.

```pug
//- ---
//- title: This is my page title
//- description: This is my page description
//- ---

p This is my page content
```

_Note that this frontmatter syntax is not valid in Pug. This is a custom syntax
specific for `norska`, hence why we need to "hide" it in comments._

## Layout

By default, all `.pug` file will use the `default` layout. You can change the
layout of a specific page by setting its `layout` key in the frontmatter.

```pug
//- ---
//- layout: blog
//- ---

p This page will use the blog layout (provided you have one)
```

Check the [layouts](/layouts/) page to see how to add your own layouts.

## Clean urls

Single files will be converted to a directory of the same name, with an
`index.html` file inside. This means that `./src/about.pug` will be converted to
`./dist/about/index.html`.

This allows cleaner url in the final website: `/about/` instead of
`/about.html`.
