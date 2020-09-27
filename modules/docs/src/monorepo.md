---
title: Monorepo
---

The GitHub repository of Norska uses a monorepo setup. Each folder in the
`./modules` directory is a different node module. The `./lib` directory is
the one published as `norska`, while all the others are dependencies. Each
dependency is focused on one task (`./css` is publshed as `norska-css` and
handles CSS compilation for example).

This split makes development easier as each module, by definition, forces
a separation of concerns. This also has the added advantage of having one
`package.json` per module, making the list of dependencies clearer to reason
about.

Lerna is used to simplify the tooling needed around the modules, more
specifically the release part. Whenever a new version of `norska` is published,
all modules are released with a new version matching the master version.

The repo also takes advantage of the workspace feature offered by Yarn. In
practice, this means that a single `yarn install` at the root of the git repo
will install all the dependencies of all the modules, in the top
`./node_modules` folder.

All development tooling (test, lint and release) is meant to be executed on the
repo (as opposed as on the modules), so the config for those tools is defined in
the repo root.

[1]: http://localhost:8083
