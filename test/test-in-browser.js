import { describe, it, before, after, beforeEach, afterEach  } from 'node:test';
import assert  from "node:assert/strict";
import { chromium } from 'playwright';
import bundle from "../src/wp-esbuild-bundler.js";
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';

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

  it("injecting transpiled code into page template works", async() => {
    await bundle({
      mode: "development",
      entryPoints: ['./test/fixtures/wordpress/mylib.js', './test/fixtures/wordpress/figure.js'],
      wordpress: {
        mappings : {
          './mylib.js' : 'window.my.lib',
        }
      },
      outdir: './test/fixtures/wordpress/build',
    });

    await page.addScriptTag( { path : './test/fixtures/wordpress/build/mylib.js'}); 
    assert(await page.evaluate(async () => typeof( window.my.lib) === 'object'), 'window.my.lib exists');

    assert(await page.evaluate(async () => window.wp.figure === undefined), 'window.wp.figure is undefined before adding the script');
    await page.addScriptTag( { path : './test/fixtures/wordpress/build/figure.js'});
    await page.addStyleTag( { path : './test/fixtures/wordpress/build/figure.css'}); 
    assert(await page.evaluate(async () => typeof( window.wp.figure) === 'object'), 'window.wp.figure exists');
  });

  it("injecting transpiled code into page template works", async() => {
    await bundle({
      mode: "development",
      entryPoints: ['./test/fixtures/wordpress/mylib.js', './test/fixtures/wordpress/figure.js'],
      wordpress: {
        mappings: {
          './mylib.js' : 'window.my.lib',
        }
      },
      outdir: './test/fixtures/wordpress/build',
    });

    await page.addScriptTag( { path : './test/fixtures/wordpress/build/mylib.js'}); 
    await page.addScriptTag( { path : './test/fixtures/wordpress/build/figure.js'});
    await page.addStyleTag( { path : './test/fixtures/wordpress/build/figure.css'}); 

    await page.evaluate(async () => {
      window.wp.element.render(
        window.wp.figure.Figure({ src : './test/fixtures/wordpress/114-800x600.jpg', caption : 'foo bar'}),
        document.getElementById('app')
      );
    });

    assert(await page.evaluate(() => document.querySelector(('#app BUTTON.components-button.has-icon SVG'))), '<SVG> icon found within button rendered by Figure');
    assert(await page.evaluate(() => document.querySelector('#app FIGURE img[src]')), '<img src=> found within button rendered by Figure');
  });
});
