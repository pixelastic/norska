---
title: Styling
---

The theme comes with a main color defined as background. To change it, you need
to overwrite the `bg-theme` class. The easiest way is to add it to your
`./src/style.css` file.

```scss
@import 'theme:style.css';

html {
  /* Set the global background color */
  .bg-theme {
    @apply bg-indigo-8;
  }
  /* Minimum card width */
  .js-masonryWall {
    @apply grid-cols-w-16;
  }
  /* Effect on hover of a card */
  .js-masonryBrick:hover {
    @apply bg-purple-1;
  }
  /* Highlighted text */
  .ais-highlight {
    @apply indigo;
  }
}
```
