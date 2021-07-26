---
title: Lazyload
---

`norska` relies on the [lazysizes](https://github.com/aFarkas/lazysizes) library
lazyload the images in your HTML markup. The build process will put all the
required attributes in your `<img />` tags and this helper will setup the
frontend accordingly.

**Note: You most probably won't even have to call this code, the theme you're
using might already be doing.**

```javascript
const lazyload = require('norska/frontend/lazyload');

lazyload.init()
```
