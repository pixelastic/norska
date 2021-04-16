---
title: Images
---

Images in `norska` are first class citizen. I spent a lot of effort into making
sure image loading is performant and seems fast.

The recommended way to add an image to a page is to use the `+img()` Pug mixin.
Note that adding images in Markdown files automatically uses this mixin
internally. This will always attempt to load the image, but also provide
a LQIP (Low Quality Image Placeholder) while the image is loading.

The specific strategy used is different based if the image is local (in the
build), or remote (with a `http(s)` url), as well if running in production or in
development.

The following table gives an overview of the choices made:

|                    | Local image | Remote image |
| ------------------ | ----------- | ------------ |
| Dev (placeholder)  | base64 LQIP | proxy LQIP   |
| Dev (full)         | direct      | proxy full   |
| Prod (placeholder) | base64 LQIP | proxy LQIP   |
| Prod (full)        | proxy       | proxy full   |

- **base64 LQIP** The LQIP is generated at build time and directly inlined in
  the `img` tag while the real image is loading
- **proxy LQIP** The LQIP is generated on the fly by an image proxy and
  displayed while the full image is loading. Because it is not instant, a gray
  placeholder will be added while the LQIP is loading.
- **direct** This is a direct link to the image, with no proxy involved
- **proxy full** The displayed image is passed through an image proxy on demand,
  compressing it on the fly.

## Image proxy

By default, `norska` uses [images.weserv.nl][1] as its
image proxy. This is a free service, based on top of Cloudflare, that allows
dynamic manipulation of images it serves, on the fly.

Thanks to this CDN, images can be resized, compressed, blurred and turned into
grayscale directly from the Pug markup.

Alternatively, Cloudinary can be used in place of `images.weserv.nl`, but you
need to have a Cloudinary account for that. If you pass a `cloudinary` key to
the `options` object, the value of the `cloudinary` key will be used as your
bucket name for Cloudinary.

In addition to the previous `options`, the following keys can be used as well:

- `pixelify` to render a pixellated image. The size of the pixels can be any
  number between `1` (large pixels) to `200` (small pixels)

### Options

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

[1]: https://images.weserv.nl/
