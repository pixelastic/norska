---
title: Markdown
---

All `.md` files in `./src` will be converted to matching `.html` files in
`./dist`.

## Frontmatter

Each file can start with a frontmatter block. Such a block is delimited by
`---` and contains key/values pairs of data that will be forwarded to the Pug
rendering engine.

You can use this block to change some of the page metadata, like its `title` or
`description`.

```md
---
title: This is my page title
description: This is my page description
---

This is my page content
```

## Layout

By default, all `.md` file will use the `default` layout. You can change the
layout of a specific page by setting its `layout` key in the frontmatter.

```md
---
layout: blog
---

This page will use the blog layout (provided you have one)
```

Check the [layouts](/layouts/) page to see how to add your own layouts.

## Clean urls

Single files will be converted to a directory of the same name, with an
`index.html` file inside. This means that `./src/about.md` will be converted to
`./dist/about/index.html`.

This allows cleaner urls in the final website: `/about/` instead of
`/about.html`.

