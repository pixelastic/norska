---
title: Sidebar
---

You can add additional widgets to the sidebar by filling the `sidebar` option.
It accepts an array of object, each object representing an Algolia widget, in
order.

Below is the list of available options:

| Key            | Usage                                                                                                | Default value           |
| -------------- | ---------------------------------------------------------------------------------------------------- | ----------------------- |
| `title`        | Title displayed in the sidebar                                                                       | `""`                    |
| `type`         | Type of [InstantSearch widget][1]. Accepts either a string or a JavaScript widget?                   | `refinementList`        |
| `options`      | Options to pass to the underlying InstantSearch widget (see [official documentation][1] for details) | `{}`                    |
| `defaultValue` | Values to be pre-filled on initial page load                                                         | `null`                  |
| `hidden`       | Called with the current page `metadata`. Do not render the widget if it returns `true`.              | `() = { return false }` |

[1]: https://www.algolia.com/doc/api-reference/widgets/js/
