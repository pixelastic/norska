---
title: Favicon
---

All `norska` websites have their favicon image defined by the theme they use.
Most of them use an emoji embedded in a `favicon.svg` file.

If you want to change the favicon used, you need to create your own
`favicon.svg` in your `./src` folder and it will be used in place of the default
one.

### Using an emoji as a favicon

A cheap way to have a custom emoji is to embed an emoji directly in the SVG.
Here is an example code you can use as a basis:

```svg
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <style>
    text {
      fill: #000000;

      font-weight: bolder;
      font-size: 100px;
      dominant-baseline: middle;
      text-anchor:middle;
    }
  </style>
  <text y="50%" x="50%">⛰</text>
</svg>
```

### Different extension

If you'd rather use a `.png` or other extension, you need to add a `favicon` key
to this `./src/_data/meta.json` pointing to the file your want to use.

For example:
```json
{
  […],
  "favicon": "assets/favicon.png"
}
```
