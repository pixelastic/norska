---
title: Styling
---

The theme comes with a main color defined as background. To change it, you need
to overwrite the `bg-theme` class. The easiest way is to add it to your
`./src/style.css` file.


```scss
@import 'theme:style.css';

.bg-theme {
  @apply bg-purple;
}

```
