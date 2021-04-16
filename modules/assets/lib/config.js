module.exports = {
  files: [
    // Static files
    '**/*.{html,txt}',
    // Images
    '**/*.{ico,jpg,jpeg,gif,png,svg}',
    // Fonts
    '**/*.{eot,otf,ttf,woff,woff2}',
    // Documents
    '**/*.pdf',
    // Custom data
    '**/*.json',
    // Exclude files on folders starting with an underscore
    '!_*/**',
  ],
  // Files to be considered as images for lazyloading
  imageExtensions: ['.png', '.jpg'],
};
