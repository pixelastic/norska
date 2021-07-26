---
title: Transforms
---

Both the `norska-theme-search` and `norska-theme-search-infinite` allow setting
a custom `transforms` key to add computed keys to your records before displaying
them.

Displaying data through a mustache-like templating language can be frustrating;
those transforms are here to allow you to update your data through JavaScript
before sending them to the rendering engine.

```javascript
// When initializing the theme
theme.init({
  ...,
  transforms: {
    displayAuthors(record) {
      return record.authors.join(", ")
    }
  }
});
// Now each record will have a {{displayAuthors}} available for rendering
```

Each key in `transforms` is a method that takes the full record as input. It
should return the value of the transformed key.

We strongly encourage you to not overwrite existing keys in your records and
instead create new keys as the order in which those methods are executed is not
guaranteed.

A special `__original` key is always created, containing the full record before
any transform is applied. All default keys are also automatically highlighted.
