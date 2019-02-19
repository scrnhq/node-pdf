import puppeteer, { Browser } from 'puppeteer';

let browser: Browser;

export default async function() {
  if (!browser) {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-dev-shm-usage', 'font-render-hinting'],
    });
  }

  return browser;
}
