const current = require('../index');
const config = require('norska-config');
const write = require('firost/lib/write');
const emptyDir = require('firost/lib/emptyDir');
const read = require('firost/lib/read');

describe('norska-html > markdown > index', () => {
  const tmpDirectory = './tmp/norska-html/markdown/index';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    config.set('runtime.productionUrl', 'http://here.com');
  });
  describe('compile', () => {
    beforeEach(async () => {
      await write(
        dedent`
      .layout-core
        block content
      `,
        config.fromPath('_includes/layouts/core.pug')
      );
      await write(
        dedent`
      .layout-custom
        block content
      `,
        config.fromPath('_includes/layouts/custom.pug')
      );
      await write(
        dedent`
      title=meta.title
      .layout-meta
        block content
      `,
        config.fromPath('_includes/layouts/meta.pug')
      );
    });
    beforeEach(async () => {
      await emptyDir(config.toPath());
    });
    it.each([
      // sourceFile, markdownSource, destinationFile, expected
      [
        'Nominal case',
        'index.md',
        '# Title',
        'index.html',
        '<div class="layout-core"><h1>Title</h1></div>',
      ],
      [
        'Sub directory',
        'about.md',
        '# Title',
        'about/index.html',
        '<div class="layout-core"><h1>Title</h1></div>',
      ],
      [
        'Custom layout',
        'about.md',
        dedent`
        ---
        layout: custom
        ---
        
        # Title`,
        'about/index.html',
        '<div class="layout-custom"><h1>Title</h1></div>',
      ],
      [
        'Custom meta',
        'about.md',
        dedent`
        ---
        title: my title
        layout: meta
        ---
        
        # Title`,
        'about/index.html',
        '<title>my title</title><div class="layout-meta"><h1>Title</h1></div>',
      ],
    ])(
      '%s',
      async (_name, sourceFile, markdownSource, destinationFile, expected) => {
        await write(markdownSource, config.fromPath(sourceFile));
        await current.compile(sourceFile, destinationFile);
        const actual = await read(config.toPath(destinationFile));
        expect(actual).toEqual(expected);
      }
    );
  });
});
