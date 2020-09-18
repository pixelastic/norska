---
title: Pug methods
---

`norska` comes bundled with a set of methods directly available in your Pug
files.

## Lodash

First of all, `lodash` is available through the `_` variable. I find `lodash` an
incredible toolbox when it comes to JavaScript. Its terse syntax fits really
well into Pug templates

## include()

By default, Pug has an `include` statement, but no `include()` methods, which
means you cannot include files dynamically (when the path is saved into
a variable).

`norska` adds this missing piece of functionality. Just
`include('path/to/file.svg')` whenever you need to include another file.

Any path starting with a `/` is considered relative to the `./src` root,
otherwise it's handled as relative to the file doing the `include`.

Also note that you can recursively include `.pug` files, and they will be
correctly compiled and transformed to HTML.

## markdown()

The `markdown()` methods converts any markdown text into its HTML version. This
can prove incredibly useful when a simple `.md` file is not enough and you need
to add some markdown content as part of a more complex layout.

## screenshot()

The `screenshot()` methods returns the url to an image representing a screenshot
of the specified page. If no argument is passed, it will use the current page. 

`norska` uses it internally for building OpenGraph previews of pages, but you
can use it for any url.

It internally uses [microlink](https://microlink.io/) to take the screenshot.

## link(target)

As its name implies, the `link()` method will return the shortest link to the
`target`. It will always return a relative link from the page calling it to the
target. 

Any target starting with a `/` is considered relative to the `./src` root,
otherwise it's handled as relative to the file doing the `include`.

## isCurrentPage(target)

This helper will return `true` if the target is the same as the page calling the
method. It's smart enough to understand all variations of `target` (with or
without final `index.html`, relative or absolute paths, etc).

Use this to style links to the current page, for example.

## img(pathOrUrl, options)

The `img()` method can be used to get the url of any image (either local or
remote). The `options` argument can be used to pass additional transformation to
the image.

If you just need to display an `<img>` tag, you should use the `+img()` mixin
instead. It accepts the exact same arguments, but will also lazy load the image
for you.
