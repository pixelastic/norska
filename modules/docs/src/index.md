Norska is a static website generator. It takes source files (pug, markdown, css
and JavaScript) and compile them into static files. The resulting directory can
then be served by services like Netlify.

Norska is opinionated. It only accepts Pug and Markdown files as input, comes
bundled with custom Tailwind CSS plugins, and automatically passes images
through an image CDN.

Norska does **exactly** what **I** need it to do, because it grew out of my need
to build websites faster. It is bundled with all my current best practices and
preferred modules, but it will also evolve as I find even better way to build
websites.

## Quick install

Start by adding Norska as part of your dev dependencies with `yarn add --dev
norska`. Then scaffold your project with `yarn run init`. Norska will create
a bunch of files for you, so now would be a good time to commit.

You can then run `yarn run serve` to serve local version of your website. Start
editing files in `./src` and your browser window will automatically update.

If you need to dig deeper (changing the layout, adding data, etc), everything is
documented on the [official website](https://projects.pixelastic.com/norska/).

Th

