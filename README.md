# 🏔️ norska

Custom SSG using Pug, Babel, Webpack, PostCSS and Tailwind.

This project grew from a bunch of scripts to convert/compile file formats to
build a static website. The scripts are short enough so I can tweak them faster
than hacking my way in existing SSGs.

## Usage

Running `norska` will convert all source files in `./src` into a static website
in `./dist`. You can overwrite the default directories with the `--from` and
`--to` options.

All `./src/*.pug` files will be converted to HTML in `./dist`. Pug layouts can
be defined in `./src/_layouts`.

Website metadata should be saved in `./src/_data.json` and will be available
from Pug pages.

`./src/style.css` is the CSS entrypoint. You can use `@import` statement to
further split your code into logical chunks. Tailwind is automatically included,
with a custom config (you can overwrite it with `--tailwindConfigFile`). All CSS
classes not actually used in the final HTML will be discarded.

`./src/script.js` is the JavaScript entrypoint. It will be compiled through
Babel and Webpack to produce one file.

Other static assets found in `./src` will be copied to `./dist`, keeping the
same directory structure. You can overwrite the list of extensions copied by
passing the `--assetsExtensions` argument.

You can pass the `--watch` argument to open a live-server of the `./dist` folder
on [http://localhost:8083][1] (use `--port` to change the port).

## Configuration

You can configure aspects of norska through the `norska.config.js` file. If the
file is present, norska will pick it up and merge it with its own default
configuration.

```js
// norska.config.js
module.exports = {
  from: './source',
  to: './build',
  port: 8080
}
```

### Updating Tailwind configuration

Update the `norska.config.js` file to tell norska where your custom Tailwind
config file is located:

```js
// norska.config.js
module.exports = {
  css: {
    tailwind: {
      configPath: '/path/to/tailwind.config.js'
    }
  }
}
```

## Contributing

### Monorepo

Norska, like all static website generators, have to deal with a multitude of
filetypes, convertings them from their source format to the ready-to-be-deployed
destination. `.md` and `.pug` files must be converted to `.html`, `.css` must be
passed through postcss, `.js` through Babel, etc.

Each of these converters need their own dependencies. The classical approach
would have been to add all the needed dependencies to the main `package.json`
but I disliked this approach as it makes it harder to remember which module is
used for what.

Instead, each converter is its own npm module, with its own `package.json`, and
`norska` itself is the glue that binds all the converters together. Norska and
its associated converters all share the same version number. So `norska` v1.2
uses `norska-assets` v1.2 and `norska-js` 1.2. This makes reasoning with
compatibility issues much easier.

Now, all the converters live under the same git repo, under the `modules/`
directory. Each of them will be independently published to npm, and the root git
repository will never be published. Actually, the root git repository takes
advantage of the workspaces feature from yarn, allowing a single `yarn install`
at the root to install all dependencies of all child modules, and sharing them
in the root `node_modules` folder.

Development tooling (like test, lint and build) is defined in the root, as part
of the `devDependencies` of the root `package.json`. Child modules don't have
any `devDependencies`, all the test/lint/build happens at the root.

`lerna` is used to automate the publishing of all the npm modules, synchronizing
their version number. `lerna` is also used to automatically symlink norska
modules so they can all import each other without needing to publish them to npm
first.

To recap, the project has one GitHub repo, that contains the core and all
related modules. This repository is never published to npm, and contains all the
tooling needed to test/lint/build the real modules. Norska and its associated
modules are all published to npm, but don't have a dedicated GitHub repository
(they are part of the root one); they also don't contain any tooling. Yarn
workspaces are used to simplify the installation and sharing of dependencies,
and lerna is used to link sibling modules together as well as publish them all
with the right version number.

[1]: http://localhost:8083
