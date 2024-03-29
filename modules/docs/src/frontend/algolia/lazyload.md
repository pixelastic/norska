---
title: Lazyload helper
---

A `lazyloadHelper` is available for convenience. It helps in handling the
lazyloading of images in search results, by displaying a blurry placeholder
while the image is loading.

_You need to have a key in your record representing metadata about the image
(dimensions, hash, lqip) as generated by
[imoen](https://projects.pixelastic.com/imoen/) for this to work._

Start by including the helper.

```javascript
const lazyloadHelper = require('norska/frontend/algolia/lazyload');
```

Then define a custom transform (for example, `img`):

```javascript
theme.init({
  ...,
  transforms: {
    img(record) {
      const slug = record.slug;

      // The full url to the image
      const originUrl = `https://www.my-site.com/pictures/${slug}.png`

      // The options
      const options = {
        // The object containing the imoen data (width, height, hash and lqip)
        imoen: record.picture,
        // A unique ID to represent that record
        uuid: record.objectID,
        // (optional) A cloudinary bucket or list of buckets
        cloudinary: 'myBucket'
        // (optional) Set to false if you don't want to append v={revHash}
        cacheBusting: false
      }

      return lazyloadHelper.attributes(originUrl, options);
    }
  }
});
```

Use the results in your `src/_includes/templates/hit.pug` template to populate
the `<img />` tag.

```pug
img(
  class="{{img.cssClass}}" 
  data-src="{{img.dataSrc}}" 
  src="{{img.src}}" 
  width="{{img.width}}" 
  height="{{img.height}}" 
  data-uuid="{{img.dataUuid}}"
)
```

On first load, it will set the dimensions of the image to the expected final
dimensions, but will set the `src` to a blurry base64 placeholder. It will also
start the download of the final image in the background. Once the image is
loaded, it will replace its `src` with the real url. It will also mark the image
as loaded in its internal memory, so on the next keystroke, the final image will
be directly displayed.

For your convenience, the `attributes` method also always returns a `lqip` and
`fullUrl` in case you need them for more specific scenarios.

