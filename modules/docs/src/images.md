---
title: Images
---

Images in `norska` are first class citizen and a lot of attention is given into
displaying them in the most optimal way.

The recommended way to add an image to a page is to use the `+img()` Pug mixin.
Note that adding images in markdown files automatically uses this mixin
internally.

## Development Vs Production

The exact behavior of the mixin is dependent on several factors including if the
image is local or remote, and if we're running in production or not.

In development, all local images are served directly, with no magic added. In
production, they will be first revved and then served through an image CDN.
Remote images will always be served through our image CDN, both in dev and prod.

## Image CDN

`norska` uses [images.weserve.nl](https://images.weserv.nl/) as its image CDN.
This is a free service, based on top of Cloudflare, that allows dynamic
manipulation of images it serves, on the fly.

Thanks to this CDN, images can be resized, compressed, blurred and turned into
grayscale directly from the Pug markup.

## Options

The `options` parameter of the `+img(target, options)` mixin accepts the
following values:

- `width` and `height`, to resize the image. If only one is passed, the image
  will be resized by keeping the same ratio.
- `quality` could be any number between `1` (worst) to `100` (best)
- `blur` could be set to any value between 1 and 2000 to control the blurriness
- `grayscale` can be set to `true` to pass the image in black and white

And additional key of `placeholder` accepts the same options but only affects
the placeholder used during the lazyloading of the images. If left empty, its
values will be derived from the main image.
