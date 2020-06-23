# 🏔️ norska

Custom SSG using Pug, Babel, Webpack, PostCSS and Tailwind.

This project grew from a bunch of scripts to convert/compile file formats to
build a static website. The scripts are short enough so I can tweak them faster
than hacking my way in existing SSGs.

## Usage

### Init

Running `yarn norska init` will scaffold your repository to be used with norska.
It will create the `./src` source folder with some default data and layout. It
will also create `build`, `build:prod` and `serve` entries to your
`package.json` with matching scripts in `./scripts` to build and serve your
website.

### Build

Running `norska build` will convert all source files in `./src` into a static
website in `./dist`. You can overwrite the root directory with `--root`, or
source and destination folders individually with `--from` and `--to`.

All `./src/*.pug` files will be converted to HTML in `./dist`. Pug layouts can
be defined in `./src/_layouts`.

Website metadata should be saved in `./src/_data/` and will be available
from Pug pages.

`./src/style.css` is the CSS entrypoint. You can use `@import` statement to
further split your code into logical chunks. Tailwind is automatically included,
with a custom config. All CSS classes not actually used in the final HTML will
be discarded (except for those starting with `ais-` or `js-`).

`./src/script.js` is the JavaScript entrypoint. It will be compiled through
Babel and Webpack to produce one file.

Static assets are copied from source to destination without any transformation,
and keeping the same directory structure.

### Serve

Running `norska serve` will build everything the same way but will also open a
live-server of the `./dist` folder on [http://localhost:8083][1] (use `--port`
to change the port).

By default, it will also open your browser to local website, but you can disable
it by passing `--no-open`.

## Configuration

You can configure aspects of norska through the `norska.config.js` file. If the
file is present, norska will pick it up and merge it with its own default
configuration.

```js
// norska.config.js
module.exports = {
  from: './source',
  to: './build',
  port: 8080,
};
```

### Default values

| Key                  | Default Value                                      | Description                                                                               |
| -------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `from`               | `./src`                                            | Source folder                                                                             |
| `to`                 | `./dist`                                           | Destination folder                                                                        |
| `port`               | `8083`                                             | Local server port                                                                         |
| `assets.files`       | `**/*.{eot,gif,html,ico,jpg,otf,png,svg,ttf,woff}` | List of files that should be copied from source to destination without any transformation |
| `js.input`           | `script.js`                                        | JavaScript entry point (relative to source) to compile through Webpack                    |
| `js.output`          | `script.js`                                        | Webpack output file (relative to destination)                                             |
| `revv.hashingMethod` | Based on the file content                          | Async method to call with the path to the file that should return the revved path         |

### Updating Tailwind configuration

A default `tailwind.config.js` file added to your project. It includes all
custom config defined in the `tailwind-config-norska` module, but you can extend
it to add your own.

You can safely remove the file; norska will then fallback to using
`tailwind-config-norska` by default.

### Custom variables

All `.js` and `.json` files located in `_data` are parsed and made available
through the `data` variable in pug templates. If the `.js` files exports
a method, the return of the method is actually used.

The `url` key also contains some useful shortcuts for crafting links. `url.base`
contains the base URL to the root of the website (value can be different from
dev and prod). `url.here` contains an absolute link to the current page.

The `revv` method is available to pug and will revv a local asset when
a production build is performed. The `lazyloadBackground` method will help
generating the `style` and `data-bg` HTML attributes needed for lazy loading of
images below the fold.

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

#### Monorepo quirks

Tooling can encounter problems when running in the context of a monorepo. This
is actually true for Jest and it required a bit of unusual scripting.

Each subrepo contains `scripts` keys in their `package.json` to run `yarn test`
and `yarn test:watch`. Those commands actually run scripts shared across all
submodules and located in `./scripts/local`. When run, those scripts move to the
top level repository root, and call `aberlaas test` from there, but pointing at
the subrepo we want to test. We do it that way because `aberlaas` is
defined as a `devDependency` on the root, on not on the submodules themselves.

This has a side-effect of having Jest considering the whole monorepo as
context when watching files. This means that whenever a file is
changed in the monorepo, Jest will re-run the tests it's watching;
even if they are not related to the changed files. In other words, running
`yarn run test:watch` in `norska-js` and editing a file in `norska-helper` will
force an undesirable run of the `norska-js` tests again.

To work around this issue, we created a `jest.config.local.js` at the root that
should be loaded by each module instead of the default `jest.config.js` file.
This custom file will dynamically exclude all other modules from the context, to
have Jest focus on the one module we want to test.

[1]: http://localhost:8083
