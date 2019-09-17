# `norska-revv`

Rename static assets and references to them using a revving hash so their cache
is more manageable.

This is only enabled for a production build and will read all `.html` files in
the destination folder, parsing links to CSS, JavaScript and images and
replacing with revved filenames while also renaming files to match.
