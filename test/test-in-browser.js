import { describe, it, before, after, beforeEach, afterEach  } from 'node:test';
import assert  from "node:assert/strict";
import { chromium } from 'playwright';
import bundle from "../src/wp-esbuild-bundler.js";
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

describe('test in browser', () => {
  const TEMPLATE_PAGE_URL = pathToFileURL(resolve('./test/fixtures/wordpress/playwright-template.html')).href;

  let browser, page;
  
  before(async () => browser = await chromium.launch());
  after(async () => await browser.close());
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(TEMPLATE_PAGE_URL);
  });
  afterEach(async () => await page.close());

  it("page template is loaded", async() => {
    const appElementExists = await page.evaluate(async () => !!document.querySelector('#app'));
    assert(appElementExists, 'div#app exists');
  });  

  it("injecting react in page template works", async() => {
    await page.addInitScript({ path: './node_modules/@wordpress/element' });
    //const appElementExists = await page.evaluate(async () => !!document.querySelector('#app'));
    //assert(appElementExists, 'div#app exists');
  });  
});
