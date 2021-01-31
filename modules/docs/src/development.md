---
title: Development
---

Norska is a fairly large project, and developing on it has a few quirks,
documented below, both for my own sake and for anyone willing to help:

## Yarn Link

When testing your local version of norska, it's nice to be able to do a `yarn
link norska` in your project. Note that because norska is a monorepo, you also
need to link the specific module you want to test, otherwise it will only link
the top-level `norska` (that won't do much more than a proxy).

So if you want to test a new CSS feature you need to `yarn link norska-css` in
addition to `yarn link norska`.

Note that you **always** need to `yarn link norska`.

## Slow Tests

Some of the tests of Norska are pretty slow, especially the ones that test
watching for file changes (basically everything related to `yarn run norska
serve`). Tests that do a full website build including image proxy and postCSS
build are also pretty slow.

Those tests are prefixed with `SLOW_` in their filename. They are automatically
excluded when running `yarn run test`. They will be run only in the following
situations:

- When manually running `yarn run test:slow`
- When releasing a new version
- When commiting a modification to them (through lint-staged)
