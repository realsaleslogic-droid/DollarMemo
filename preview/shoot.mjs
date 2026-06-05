// Render the built single-file preview in headless Chromium and screenshot the
// landing hero so we can visually verify the 3D character.
import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(dir, '../dist-preview/index.html');
const out = path.resolve(dir, '../dist-preview/shot.png');

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--enable-webgl',
  ],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900, deviceScaleFactor: 2 } });
page.on('console', (m) => console.log('PAGE:', m.type(), m.text()));
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
const heroClip = { x: 630, y: 70, width: 600, height: 470 };

// Default view
await page.mouse.move(900, 300);
await page.waitForTimeout(2500); // let WebGL render + animate a few frames
await page.screenshot({ path: out });
await page.screenshot({ path: path.resolve(dir, '../dist-preview/shot-hero.png'), clip: heroClip });

// Mouse far LEFT — figure should turn left
await page.mouse.move(40, 450);
await page.waitForTimeout(1200);
await page.screenshot({ path: path.resolve(dir, '../dist-preview/shot-left.png'), clip: heroClip });

// Mouse far RIGHT — figure should turn right
await page.mouse.move(1240, 450);
await page.waitForTimeout(1200);
await page.screenshot({ path: path.resolve(dir, '../dist-preview/shot-right.png'), clip: heroClip });

console.log('saved', out);

// Tight, high-res capture of the hero SVG itself to inspect the objects.
const svg = await page.$('svg[viewBox="0 0 300 360"]');
if (svg) await svg.screenshot({ path: path.resolve(dir, '../dist-preview/shot-svg.png') });
await browser.close();
