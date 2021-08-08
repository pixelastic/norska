---
title: Templates
---

It is expected that you overwrite some of the theme templates (search result or
footer for example) to suit your specific need.

Below are all the templates you can overwrite, along with links to their default
implementation.

| Filepath                                  | Usage                           |
| ----------------------------------------- | ------------------------------- |
| [src/\_includes/templates/hit.pug][1]     | A search result                 |
| [src/\_includes/templates/logo.pug][2]    | Home logo in the main searchbar |
| [src/\_includes/templates/filters.pug][3] | Additional filters modal        |
| [src/\_includes/templates/footer.pug][4]  | Footer after all search results |

If your hit template contains an image, you should add the class
`js-masonryImage` to it so the theme correctly resize the brick once the image
is loaded.

[1]: https://github.com/pixelastic/norska-theme-search-infinite/blob/master/src/_includes/templates/hit.pug
[2]: https://github.com/pixelastic/norska-theme-search-infinite/blob/master/src/_includes/templates/logo.pug
[3]: https://github.com/pixelastic/norska-theme-search-infinite/blob/master/src/_includes/templates/filters.pug
[4]: https://github.com/pixelastic/norska-theme-search-infinite/blob/master/src/_includes/templates/footer.pug
