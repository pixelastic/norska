# Norska-config

Singleton that contains the current configuration object.

When norska loads, it merges the user-specified command-line arguments with its
default config to init this singleton. Then, any module can import it and get
access to the current configuration through `config.get('path.to.key')`.

## Usage

```js
import config from `norska-config`
console.info(`Converting from ${config.from()} to ${config.to()}`)
console.info(config.get('port'));
```

## Keys

| Key                  | Description                                | Default value                                |
| -------------------- | ------------------------------------------ | -------------------------------------------- |
| `watch`              | Starts a local live version of the website | `false`                                      |
| `port`               | Port used for the local live version       | `8083`                                       |
| `from`               | Source directory                           | `./src`                                      |
| `to`                 | Destination directory                      | `./dist`                                     |
| `assetsExtensions`   | Extension of files that should be copied   | `gif,jpg,png,ico,html,svg,ttf,otf,woff`      |
| `tailwindConfigFile` | Path to the Tailwind config file           | `tailwind.config.js` included in this module |
