---
title: norska serve
---

The `norska serve` command will build the website and serve it locally. It will
automatically reload whenever a source file is changed.

The command is aliased to `yarn run serve` for convenience.

## Usage

Whenever you're working on your website, start `yarn run serve` in a terminal
window. This will open a live preview of the website on
[http://127.0.0.1:8083/][1].  Then start working on any file in `./src`, and
whenever you'll save, your browser window will reload with the new version.

The command is smart enough to recognize any change to `.pug`, `.md`, `.css`,
`.js` or `.json` file and reload the website accordingly.

## Options

### Changing the default port

By default, the website will be served on port `8083`. If the port is already
taken, it will find a random another free port. 

You can force using a specific port by either using the `--port=` command line
flag, or setting it in the `norska.config.js` file. If the port is already
taken, the command will fail.

### Preventing the browser from opening

When the local website is started, your browser will automatically open to load
it. 

You can disable this behavior by either passing `--no-open` to the command line
or setting `open: false` in `norska.config.js`

[1]: http://127.0.0.1:8083/
