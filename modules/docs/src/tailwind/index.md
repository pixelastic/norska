---
title: Tailwind
---

In addition to the base [Tailwind](https://tailwindcss.com/) and its [Typography
plugin](https://tailwindcss.com/docs/typography-plugin), `norska` comes with its
own additions.

## Scale

`norska` uses a custom scale for all dimension-based classes.

The same base scale is used for `width` and `height` (including `min` and `max`)
variants, as well as `margin`, `padding`, `borders` and `absolute` positioning.

The base scale has 20 steps, ranging from `w-1` (`1rem`) to `w-20` (`28rem`).
Values smaller than `1rem` can be achieved with `w-01` through `w-04`. Really
really small values are available with `w-001` and `w-002`.

Percentage values are also accessible with keys ending with `p`. `w-20p` means
`width: 20%`. All multiples of 10 are available, as well as the common `25p`,
`33p`, `66p` and `75p`.

Some width relative to the number of characters in a row are also available:
`25ch`, `50ch`, `65ch`, `75ch` and `100ch`, as well as `prose` set to `65ch`.

To cover the last cases, the following values are also added: `50vh`, `50vw`,
`100vh`, `100vw`, `0`, `none` and `auto`.


## Plugins

`norska` also cames bundled with its own set of custom Tailwind plugins. Below
is the list of plugins and what they add.

### textColor

This plugin adds syntactic sugar to write text-coloring classes without the
`.text-` prefix. You can write `.blue` instead of `.text-blue` to set the text
to blue.

This maintains the ability to change the text opacity through `.text-opacity-XX`
classes.
