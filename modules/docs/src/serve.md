---
title: norska serve
---

The `norska serve` command will build the website and serve it locally. It will
automatically reload whenever a source file is changed.

The command is aliased to `yarn run serve` for convenience.

## Usage

Whenever you're working on your website, start `yarn run serve` in a terminal
window. This will open a live preview of the website on [http://127.0.0.1:8083/][1].
Then start working on any file in `./src`, and whenever you'll save, your
browser window will reload with the new version.

The command should be smart enough to recognize any change to `.pug`, `.md`,
`.css`, `.js` or `.json` file.

## Options

You can change the port on which the server is running through the `port`
option, and disable the opening of the browser window through the `open`
options.

Both options can either be set from the command line (`--port=8090`) or through
the `norska.config.js` file.

[1]: http://127.0.0.1:8083/
