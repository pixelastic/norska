---
title: Styling
---

To change the styling of the default theme, you'll have to overwrite it. The
easiest way is to make your selectors more specific by prepending `body` to
them in your `style.css`.

```scss
@import 'theme:style.css';

body {
  .theme-header {
    @apply bg-black;
  }
  .theme-sidebar-title {
    @apply text-5 bg-black;
  }
  .theme-menu-icon:hover {
    @apply red-7;
  }

  /* Hits */
  @screen xl {
    .ais-Hits-item {
      @apply w-50p;
    }
  }

  /* Refinement List */
  .ais-RefinementList-label {
    &:hover {
      @apply red-7;
    }
  }
  .ais-RefinementList-item--selected {
    .ais-RefinementList-label {
      &:before {
        @apply bg-red-9;
      }
      &:after {
        @apply border-red-9;
      }
      &:hover {
        @apply red-9;
      }
    }
  }
  .ais-RefinementList-showMore {
    @apply red-9;
  }

  /* Range Slider */
  .ais-RangeSlider {
    .rheostat-progress,
    .rheostat-tooltip {
      @apply bg-red-9;
    }
    .rheostat-handle {
      @apply border-red-9;
      &:hover,
      &:active {
        @apply border-red-7;
        .rheostat-tooltip {
          @apply bg-red-7 white;
        }
      }
    }
  }
}
```
