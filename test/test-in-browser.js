import { describe, it, before, after, beforeEach, afterEach  } from 'node:test';
import assert  from "node:assert/strict";
import { chromium } from 'playwright';
import bundle from "../src/wp-esbuild-bundler.js";
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

describe('test in browser', () => {
  const TEMPLATE_PAGE_URL = pathToFileURL(resolve('./test/fixtures/wordpress/gutenberg-stub.html')).href;

  let browser, page;
  
  before(async () => browser = await chromium.launch());
  after(async () => await browser.close());
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(TEMPLATE_PAGE_URL);
    // try {
    //   await page.addInitScript({ path: './test/fixtures/wordpress/build/gutenberg-stub.js' });
    // } catch(ex) {
    //   debugger
    //   console.error(ex);
    // }
  });
  afterEach(async () => await page.close());

  it("page template is loaded", async() => {
    assert(await page.evaluate(async () => !!document.querySelector('#app')), 'div#app exists');
  });  

  it("injecting react in page template works", async() => {
    assert(await page.evaluate(async () => typeof( window.wp) === 'object'), 'window.wp exists');

    assert(await page.evaluate(async () => typeof( window.wp.components) === 'object'), 'window.wp.components exists');
  });  
});
