// import puppeteer from 'puppeteer';
// import config from 'norska-config';
// import helper from 'norska-helper';
// import isPortReachable from 'is-port-reachable';
// import { chalk } from 'golgoth';

module.exports = {
  // This is currently disabled to make installing deps faster
  // async run(options) {
  //   const timer = helper.timer();
  //   const url = options.url;
  //   const output = options.output || `${config.from()}/screenshot.png`;
  //   const selector = options.selector;
  //   const dimensions = {
  //     width: 1600,
  //     height: 900,
  //   };
  //   // Check that server is actually running
  //   const port = config.get('port');
  //   if (!(await isPortReachable(port))) {
  //     process.exitCode = 1;
  //     console.error(`Live server is not reachable on port ${port}.`);
  //     console.error('Please run norska watch and try again');
  //     return;
  //   }
  //   const browserOptions = {
  //     headless: true,
  //     // Setting the window size is needed for media queries based on
  //     // device-aspect-ratio to work. Otherwise the default size of 800x600 is
  //     // assumed.
  //     args: [`--window-size=${dimensions.width},${dimensions.height}`],
  //   };
  //   const browser = await puppeteer.launch(browserOptions);
  //   const page = await browser.newPage();
  //   await page.goto(`http://localhost:${port}/${url}`);
  //   await page.setViewport({
  //     width: dimensions.width,
  //     height: dimensions.height,
  //   });
  //   // Take screenshot of a specific area or full page
  //   const target = selector ? await page.$(selector) : page;
  //   await target.screenshot({ path: output });
  //   const message = `✔ Saving ${chalk.bold.yellow(
  //     output
  //   )} in ${timer.elapsed()}`;
  //   console.info(message);
  //   await browser.close();
  // },
};
