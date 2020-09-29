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
documented on the [official website][1].

## Examples

Here is a list of websites built with norska

| [![Pixelastic][15]][14]              | [![D&D Maps][5]][4]                  | [![D&D Monsters][3]][2]  |
| ------------------------------------ | ------------------------------------ | ------------------------ |
| [![Painting][17]][16]                | [![Pathfinder Society Search][7]][6] | [![Magic Trick][13]][12] |
| [![Baldur's Gate Artefacts][11]][10] | [![NPC Avatars][9]][8]               |                          |

[1]: https://projects.pixelastic.com/norska/
[2]: https://gamemaster.pixelastic.com/monsters/dnd/
[3]: https://res.cloudinary.com/pixelastic-monsters/image/fetch/f_auto,w_300/https://api.microlink.io/%3Fembed=screenshot.url&meta=false&screenshot=true&url=https%3A%2F%2Fgamemaster.pixelastic.com%2Fmonsters%2Fdnd
[4]: https://gamemaster.pixelastic.com/maps/
[5]: https://images.weserv.nl/?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26screenshot%3Dtrue%26url%3Dhttps%253A%252F%252Fgamemaster.pixelastic.com%252Fmaps%252F&af&il&w=300
[6]: https://gamemaster.pixelastic.com/society/
[7]: https://images.weserv.nl/?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26screenshot%3Dtrue%26url%3Dhttps%253A%252F%252Fgamemaster.pixelastic.com%252Fsociety%252F&af&il&w=300
[8]: https://gamemaster.pixelastic.com/npcs/
[9]: https://images.weserv.nl/?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26screenshot%3Dtrue%26url%3Dhttps%253A%252F%252Fgamemaster.pixelastic.com%252Fnpcs%252F&af&il&w=300
[10]: https://gamemaster.pixelastic.com/artefacts/
[11]: https://res.cloudinary.com/pixelastic-artefacts/image/fetch/f_auto,w_300/https://api.microlink.io/%3Fembed=screenshot.url&meta=false&screenshot=true&url=https%3A%2F%2Fgamemaster.pixelastic.com%2Fartefacts
[12]: https://projects.pixelastic.com/magic/
[13]: https://images.weserv.nl/?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26screenshot%3Dtrue%26url%3Dhttps%253A%252F%252Fprojects.pixelastic.com%252Fmagic%252F&af&il&w=300
[14]: https://www.pixelastic.com/
[15]: https://images.weserv.nl/?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26screenshot%3Dtrue%26url%3Dhttps%253A%252F%252Fpixelastic.com%252F&af&il&w=300
[16]: https://painting.pixelastic.com/
[17]: https://images.weserv.nl?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26screenshot%3Dtrue%26url%3Dhttps%253A%252F%252Fpainting.pixelastic.com&af&il&w=300
