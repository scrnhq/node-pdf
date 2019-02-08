import puppeteer, { Browser } from 'puppeteer';

let browser: Browser;

export default async function() {
  if (!browser) {
    browser = await puppeteer.launch();
  }

  return browser;
}
