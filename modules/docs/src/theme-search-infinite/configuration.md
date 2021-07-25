---
title: Configuration
---

The call to `theme.init()` accepts a range of different options, described
below:

| Key           | Usage                                                             | Default value         |
| ------------- | ----------------------------------------------------------------- | --------------------- |
| `hitName`     | Name of the items to search, used in the `XXX items found`        | `item`                |
| `placeholder` | Text displayed in the searchbar when query is empty               | `Search for anything` |
| `transforms`  | [Transforms][2] to apply to each hit                              | `{}`                  |
| `widgets`     | Array of additional InstantSearch [widgets][1] to add to the page | `[]`                  |

[1]: ./widgets
[2]: ./transforms
