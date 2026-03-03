const { setWorldConstructor, setDefaultTimeout, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const VIDEOS_DIR = path.join(process.cwd(), 'videos');

class PlaywrightWorld {
  constructor({ attach, parameters }) {
    this.attach = attach;
    this.parameters = parameters;
    this.browser = null;
    this.context = null;
    this.page = null;
  }
}

setWorldConstructor(PlaywrightWorld);
setDefaultTimeout(60 * 1000);

Before(async function () {
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }

  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext({
    recordVideo: {
      dir: VIDEOS_DIR,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });
  this.page = await this.context.newPage();
});

After(async function (scenario) {
  if (this.page) {
    const screenshot = await this.page.screenshot();
    await this.attach(screenshot, 'image/png');
  }

  if (this.context) {
    await this.context.close();
  }

  if (this.browser) {
    await this.browser.close();
  }
});
