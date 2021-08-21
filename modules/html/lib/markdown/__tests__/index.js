const current = require('../index');
const config = require('norska-config');
const { emptyDir, read, write } = require('firost');
const path = require('path');

describe('norska-html > markdown > index', () => {
  const tmpDirectory = './tmp/norska-html/markdown/index';
  const themeDirectory = path.resolve(tmpDirectory, 'theme');
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
      theme: themeDirectory,
    });
    await emptyDir(tmpDirectory);
    // Default theme layout
    await write(
      dedent`
        .default
          block content
    `,
      config.themeFromPath('_includes/layouts/default.pug')
    );
    // Custom project layout
    await write(
      dedent`
      title=data.meta.title
      .project
        block content
      `,
      config.fromPath('_includes/layouts/project.pug')
    );

    config.set('runtime.productionUrl', 'http://here.com');
  });
  describe('compile', () => {
    it.each([
      // sourceFile, markdownSource, destinationFile, expected
      [
        'Use default layout',
        'index.md',
        'content',
        'index.html',
        '<div class="default"><p>content</p></div>',
      ],
      [
        'Use custom layout',
        'index.md',
        dedent`
          ---
          layout: project
          title: my title
          ---
          
          content
          `,
        'index.html',
        '<title>my title</title><div class="project"><p>content</p></div>',
      ],
      [
        ': in frontmatter',
        'index.md',
        dedent`
          ---
          title: "404: Page not found"
          layout: project
          ---
          
          content
          `,
        'index.html',
        '<title>404: Page not found</title><div class="project"><p>content</p></div>',
      ],
    ])(
      '%s',
      async (_name, sourceFile, markdownSource, destinationFile, expected) => {
        await write(markdownSource, config.fromPath(sourceFile));
        await current.compile(sourceFile, destinationFile);
        const actual = await read(config.toPath(destinationFile));
        expect(actual).toEqual(expected);
        expect(config.get(['runtime', 'htmlFiles', sourceFile])).toEqual(
          destinationFile
        );
      }
    );
  });
});
