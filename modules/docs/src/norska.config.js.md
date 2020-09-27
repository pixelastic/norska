---
title: norska.config.js
---

You can configure aspects of norska through the `norska.config.js` file. If the
file is present, norska will pick it up and merge it with its own default
configuration.

For example, to change the source and destination folder as well as the default
port for local testing, you can set your `norska.config.js` file like this:

```js
module.exports = {
  from: './source',
  to: './build',
  port: 8080,
};
```

## Available options

### `from`

The `from` key defines the source folder to read. Default is `./src`.

### `to`

The `to` key defines the destination folder where compiled files will be written
to. Default is `./dist`.

### `port`

The `port` key defines the port used for running the website during development.
Default value is `8083`, but it will fallback to a random available port if this
one is unavailable.

### `js.input`

The `js.input` key defines the entrypoint used for compiling the JavaScript,
relative to the source folder. Default is `script.js`.

### `css.input`

The `css.input` key defines the entrypoint used for compiling the CSS,
relative to the source folder. Default is `style.css`.

### `assets.files`

The `assets.files` key defines which files are to be considered as assets. Asset
files are copied from source to destination, without any transformation. It
expects a glob, relative to the source folder.

The default list is `**/*.{eot,gif,html,ico,jpg,otf,png,svg,ttf,woff}`.

### `revv.hashingMethod`

By default, Norska will revv all relevant files (CSS, JavaScript and
assets). This means that it will change their URL, so it includes a hash derived
from the file content. Whenever the file changes, its URL will change as well.
This is meant to bypass any caching issue.

If present, the `revv.hashingMethod` key lets you define your own hashing
method. It takes a relative `filepath` as argument and is expected to return the
new filepath. The file will then be copied to this new filepath.
