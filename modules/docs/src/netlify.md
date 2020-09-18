---
title: Netlify
---

`norska` has been developed to make deployment on Netlify easy. In that regard,
it tries to minimize the number of build minutes used by Netlify deployment. The
method used is to cancel any build that wouldn't change the final generated
content.

## How it works

Whenever a build is made, Norska checks to see if it's running on Netlify and
building for production. If both those conditions are true, then it starts
a serie of additional checks.

It starts by getting the list of files in the repo that where changed since the
last Netlify deploy. The SHA-1 of the last deployed commit is provided by
Netlify; the rest is extracted from the git history.

It then cancels the build if no _relevant_ file was changed since the last
deploy.

_Relevant_ files include anything in `./src`, but also config files like
`netlify.toml`, `.nvmrc`, `tailwind.config.js`, `norska.config.js`, etc.

If no such file was changed, it means that all changes since the last deploy
were touching parts of the repo that shouldn't have any impact on the final
deployed website. This could happen quite often in a mono-repo setup: you make
a lot of changes to the codebase in `./lib`, but you don't need to redeploy the
documentation website each time.

In addition to checking for files, `norska` will also check for changed keys in
the project `package.json`. If the `dependencies` key has changed (like a new
version of `norska`, or any front-end dependency), then it will go through with
the build.

## Configuration

You can change the list of files and keys of `package.json` considered
_relevant_ by editing the `norska.config.js` file.

The default configuration is as follow:

```js
module.exports = {
  deploy: {
    files: [
      'lambda/**/*',
      'netlify.toml',
      'norska.config.js',
      'tailwind.config.js',
      '.nvmrc',
      '<from>/**/*',
    ],
    keys: ['dependencies', 'scripts.build:prod'],
  },
};
```

