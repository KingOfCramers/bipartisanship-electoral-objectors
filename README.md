# 🏛️ Bipartisanship Rates among Electoral Objectors

This is the source code for an analysis of bipartisanship rates among Republican lawmakers who objected to the 2020 election results produced for National Journal.

## Installation

This program runs using Node.js, please [install](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) the `npm` package management library for it to work. 

Then navigate into the directory and run:

`npm install` or `yarn install`

## Run

`npm run start` 

This command will run the program.

By default, it'll check the House lawmakers in Puppeteer's headless mode. That can be changed by altering the constants contained in the `index.ts` file.

Note: You may need to replace the `executablePath` in your `src/setupPuppeteer/index.ts` file to your local installation of Chromium. By default it's pointing at `/usr/local/bin/chromium`.
