---
title: Opinionated
---

`norska` is opinionated, but what does it mean exactly?

In my career, I had to build a lot of websites using various static Website
Generators (Jekyll, Middleman, Brunch, Metalsmith, Eleventy, etc). Each
experience was different, and they all had their pros and cons: some were quick
to build, some had great livereload, some could be easily extended, some had
great documentation and plugins, but none had all of that.

Each time, I had to plug the missing part with some custom scripts. After
a while, most of my installations were mostly custom script and only a small
layer of SSG.

That's when I decided to package those scripts into one module, so I would only
have to `npm install` one package instead of copy-pasting my scripts from
project to project. That's when I started stitching those scripts back together
under one cohesive umbrella.

`norska` is not meant to work for all use-cases, but it's definitely working for
my use-case, and allows me to develop new websites really quickly, going from
idea to deployment in hours instead of weeks.

Those opinions mostly boils down to the tech stack:

- It uses Pug as the main templating engine. Yes, Pug is old and has a lot of
  quirks, but its terse syntax works really well with Tailwind (see next point)
- It uses Tailwind with a set of custom plugins to allow rapidly building custom
  designs
- It packages all JavaScript code through Webpack
- Images are automatically lazy-loaded through a CDN
- Deployment on Netlify is automated and optimized



