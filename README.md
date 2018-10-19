# 🏔️ norska

Custom SSG using Pug, Babel, Webpack, PostCSS and Tailwind.

This project grew from a bunch of scripts to converts/compiles file formats to
build a static website. The scripts are short enough so I can tweak faster them
than hacking my way in existing SSGs.

# Usage

## As a command line tool

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

`./src/script.js` is the JavaScript entrypoint. It will be compile through Babel
and Webpack to produce one file.

Other static assets found in `./src` will be copied to `./dist`, keeping the
same directory structure. You can overwrite the list of extensions copied by
passing the `--assetsExtensions` argument.

You can pass the `--watch` argument to open a live-server of the `./dist`
folder on [http://localhost:8083](http://localhost:8083) (use `--port` to change the port).

## As a module

### defaultConfig()

Returns the default configuration. This can be used to access the filepath to
the config files used internally in case you want to extend them.

```js
import norska from 'norska';
const config = norska.defaultConfig();
console.info(config.css.tailwindConfigFile);
```

# Known limitations

- Host project must have `babel-loader` as part of the dependencies. `yarn add
  --dev babel-loader`


