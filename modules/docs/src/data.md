---
title: Data
---

All `.json` files stored in `./src/_data` will be made available to
the Pug rendering engine through the `data` key.

This means that if you have a file `./src/_data/user.json` like this:

```json
{
  "firstName": "Tim",
  "lastName": "Carry"
}
```

You'll be able to use it in `./src/index.pug` like this:

```pug
dl
  dt First Name
  dd=data.user.firstName
  dt Last Name
  dd=data.user.lastName
```

## As JavaScript files

You can also use `.js` files instead of `.json` files. Using JavaScript is much
more powerful than JSON because you can:

- Add some conditional logic to the values
- `require` dependencies
- Export functions and not only numbers/strings/arrays/objects
- Add comments

For example, if you need to configure an external service with `dev`/`prod`
capabilities, you could create a `./src/_data/service.js`:

```js
const devCredentials = {
  userName: 'dev',
  password: '1234',
};
const prodCredentials = {
  userName: process.env.USER_NAME,
  password: process.env.PASSWORD,
};
const isProd = process.env.NODE_ENV === 'production'
module.exports = isProd ? prodCredentials : devCredentials;
```

### Exporting a function

You can also export a function instead of an object. In that case, norska will
call the function and return its return value. The function will be called with
`await`, so you can make it `async` if you need to call an external service or
read files on disk if you wish.

The method will be called with one argument, `config`, that provides a few
helper methods, in case you need them:

- `rootPath(relativePath)` will return the full path to a file, relative to the
  norska root
- `fromPath(relativePath)` will return the full path to a file, relative to the
  norska source folder (default is `./src`)
- `toPath(relativePath)` will return the full path to a file, relative to the
  norska destination folder (default is `./dist`)
- `themePath(relativePath)` will return the full path to a file, relative to the
  norska current theme folder

## Frontmatter

In addition to the files stored in `./src/_data`, any key added to a file
frontmatter will be available through the `meta` key.

So, given this `.pug` file:

```pug
//- ---
//- title: My custom title
//- ---

p This is my page
```

You'll then be able to access the `meta.title` key in your layout; to add it at
the top of the page for example.

## Builtin data

Norska also add the `url` data object to all pages. It contains the following
keys:

- `url.base` is the absolute URL to the website root
- `url.here` is the relative path, from the website root, to the current page
- `url.pathToRoot` is the relative path, from the current page, to the website
  root

Those keys are mostly used internally to generate links, but you might need them
as well.

