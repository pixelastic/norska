import path from 'path';
import { pMap, firost } from 'golgoth';
import helper from 'norska-helper';
import config from 'norska-config';
import autoprefixer from 'autoprefixer';
import postcssClean from 'postcss-clean';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import postcssPurge from '@fullhuman/postcss-purgecss';
import postcss from 'postcss';
import tailwind from 'tailwindcss';

export default {
  postcssPlugins() {
    const tailwindConfigFile = config.get('css.tailwind.configPath');
    const plugins = [
      postcssImport(),
      tailwind(tailwindConfigFile),
      postcssNested,
    ];

    // Add more plugins when building
    if (!this.isProduction()) {
      return plugins;
    }

    plugins.push(
      postcssPurge({
        content: [path.join(config.to(), '*.html')],
        whitelistPatterns: [/^ais-/],
      })
    );

    plugins.push(autoprefixer);

    const cleanCssOptions = {
      level: {
        1: {
          specialComments: false,
        },
      },
    };

    plugins.push(postcssClean(cleanCssOptions));

    return plugins;
  },

  // Are we building (as opposed to local serve)
  isProduction() {
    return process.env.NODE_ENV === 'production';
  },

  // Custom config added to the main config.css key
  config() {
    return {
      tailwind: {
        configPath: path.resolve(__dirname, '../build/tailwind.config.js'),
        // This method can be overwritten by the user to modify the config with
        // its own keys before being loaded
        configHook(tailwindConfig) {
          return tailwindConfig;
        },
      },
    };
  },

  // Compile the css source file to docs
  async compile(source) {
    const rawContent = await firost.read(source);
    const relativePath = path.relative(config.from(), source);
    const destination = path.join(config.to(), relativePath);

    const plugins = this.postcssPlugins();
    const result = await postcss(plugins).process(rawContent, {
      from: source,
      to: destination,
    });
    await helper.writeFile(result.css, destination);
  },

  // Compile all css files
  async run() {
    const cssFiles = await helper.getFiles('style.css');

    await pMap(cssFiles, async filepath => {
      await this.compile(filepath);
    });
  },

  // Listen to changes in css files and rebuild them
  watch() {
    const from = config.from();
    // Rebuild main file when changed
    firost.watch(path.join(from, 'style.css'), filepath => {
      this.compile(filepath);
    });
    // Rebuild main file when includes are changed
    firost.watch(path.join(from, '_styles/*.css'), () => {
      this.compile('./src/style.css');
    });
    // Rebuild all files when main tailwind config is changed
    const tailwindConfigFile = config.get('css.tailwind.configPath');
    firost.watch(tailwindConfigFile, () => {
      this.run();
    });
  },
};
