---
title: Meta config
---

You can edit the `./src/_data/meta.json` (or `.js`) file to update your website
metadata.

The default `meta.json` looks something like this. Values defined in it are
mostly used to populate the `<head>` of your pages.

```json
{
  "description": "Your website description. You can overwrite it in any pug file",
  "title": "Default page title. You can overwrite it in any pug file",
  "twitter": "yourusername",
  "productionUrl": "http://www.your-production-url.com/"
}
```

Any value added to this file will be available in pug files as `data.meta.*`.

### Favicon

The default favicon file used by `norska` is `favicon.svg`, but you can override
it by adding a `favicon` key to this file.

For example:
```json
{
  […],
  "favicon": "assets/favicon.png"
}
```
