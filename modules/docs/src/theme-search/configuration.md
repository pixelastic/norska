---
title: Configuration
---

The call to `theme.init()` accepts a range of different options, described
below:

| Key                | Usage                                                                | Default value         |
| ------------------ | -------------------------------------------------------------------- | --------------------- |
| `credentials`      | `appId`, `apiKey` and `indexName` credentials to query Algolia       | `{}`                  |
| `hitName`          | Name of the items to search, used in the `XXX items found`           | `item`                |
| `onSearch`         | Method to call on each search. Called with `query` and `helper`.     | `() => {}`            |
| `placeholder`      | Text displayed in the searchbar when query is empty                  | `Search for anything` |
| `searchParameters` | Optional `searchParameters` to pass                                  | `{}`                  |
| `sidebar`          | Array of additional InstantSearch widgets to add in the [Sidebar][1] | `[]`                  |
| `transforms`       | [Transforms][2] to apply to each hit                                 | `{}`                  |

[1]: ./sidebar
[2]: ./transforms
