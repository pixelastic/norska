---
title: Hooks
---

Sometimes you need to do something that could not be achieved with the classical
file structure. Maybe you need to create hundred of pages, one for each entry in
a `.json` file.

When the times come for such automation, `norska` provides some hooks for your
to use.

## afterHtml

The `afterHtml` hook runs after all the default HTML files are created (this
include both those from `.pug` and `.md` files).

You can define it in your `norska.config.js` like this:

```js
module.exports = {
  hooks: {
    async afterHtml({ createPage }) {
      // Add your custom logic here
    }
  }
}
```

The hook is `async`hronous, so you can `await` for any method call inside, even
calling an external API if you need.

It is also called with the `createPage` helper function. This function expect
three arguments: `template`, `destination` and `data`. It will compile the
`template` at `destination` with the `data`.

- `template` can be any `.pug` file, relative to the `./src` folder
- `destination` should be a filepath relative to the `./dist` folder
- `data` should be an object whose keys will be available in the template
