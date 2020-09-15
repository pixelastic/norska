---
title: Installation
---

To build a website using `norska`, you first need to add it to your
`devDependencies`.

```js
yarn add --dev norska
```

## Initialisation

Then, run `yarn run norska init` to scaffold your directories. This will also
register your website on Netlify.

At this stage, you should be able to `git commit` your changes, push back to
your repository, and your website will be deployed on Netlify automatically.

## Checking your website

Run `yarn run serve` to have norska build your website and serve it locally.

## Adding your content

You can modify any file in `./src` directory and have it automatically update
while the `serve` command is running.

Any `.pug` or `.md` file saved in `./src` will be converted into HTML.



