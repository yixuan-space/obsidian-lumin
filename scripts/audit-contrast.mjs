import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('../', import.meta.url));
const candidates = [process.env.EDGE_PATH,
  process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Microsoft/Edge/Application/msedge.exe'),
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable'];
let executablePath;
for (const candidate of candidates.filter(Boolean)) {
  try { await fs.access(candidate); executablePath = candidate; break; } catch {}
}
if (!executablePath) throw new Error('Microsoft Edge not found. Set EDGE_PATH to its executable path.');

// Normal text needs 4.5:1. Muted labels on nested surfaces and links inside
// sidebars are held at 4:1 and 3:1 so the audit catches drift without forcing
// a uniform palette everywhere. Accent controls and graph dots are non-text UI.
const groups = [
  { name: 'text', min: 4.5, pairs: [
    ['text-normal', 'background-primary'],
    ['text-normal', 'background-primary-alt'],
    ['text-normal', 'background-secondary'],
    ['text-normal', 'background-secondary-alt'],
    ['text-normal', 'canvas-background'],
  ] },
  { name: 'muted', min: 4.5, pairs: [
    ['text-muted', 'background-primary'],
  ] },
  { name: 'muted-surface', min: 4, pairs: [
    ['text-muted', 'background-primary-alt'],
    ['text-muted', 'background-secondary'],
    ['text-muted', 'background-secondary-alt'],
    ['canvas-card-label-color', 'canvas-background'],
  ] },
  { name: 'link', min: 4.5, pairs: [
    ['link-color', 'background-primary'],
    ['link-color-hover', 'background-primary'],
  ] },
  { name: 'nested-link', min: 3, pairs: [
    ['link-color', 'background-secondary'],
    ['link-color-hover', 'background-secondary'],
    ['link-unresolved-color', 'background-primary'],
    ['link-unresolved-color', 'background-secondary'],
  ] },
  { name: 'ui', min: 3, pairs: [
    ['interactive-accent', 'background-primary'],
    ['text-on-accent', 'interactive-accent'],
    ['graph-node', 'background-primary'],
    ['graph-node-focused', 'background-primary'],
  ] },
];

const browser = await chromium.launch({ executablePath, headless: true });
const checks = [];
const failures = [];
try {
  const page = await browser.newPage();
  await page.route('https://lumin.test/**', async route => {
    const filename = new URL(route.request().url()).pathname.slice(1);
    if (['app.css', 'theme.css'].includes(filename)) return route.fulfill({ contentType: 'text/css', body: await fs.readFile(path.join(root, filename), 'utf8') });
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head></head><body></body></html>' });
  });
  await page.goto('https://lumin.test/');
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://lumin.test/app.css"><link rel="stylesheet" href="https://lumin.test/theme.css"></head><body><div id="probe"></div></body></html>', { waitUntil: 'load' });

  for (const mode of ['light', 'dark']) {
    for (const palette of ['', 'lumin-mist', 'lumin-moss', 'lumin-warmgray']) {
      const ratios = await page.evaluate(({ mode, palette, groups }) => {
        document.body.className = `theme-${mode} ${palette}`;
        const style = getComputedStyle(document.body);
        const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
        const context = canvas.getContext('2d');
        const rgb = color => { context.fillStyle = color; context.fillRect(0, 0, 1, 1); return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3); };
        const luminance = color => rgb(color).map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
        const ratio = (foreground, background) => {
          const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
          return (light + 0.05) / (dark + 0.05);
        };
        return Object.fromEntries(groups.flatMap(group => group.pairs.map(([foreground, background]) => {
          const key = `${foreground}/${background}`;
          const foregroundValue = style.getPropertyValue('--' + foreground).trim();
          const backgroundValue = style.getPropertyValue('--' + background).trim();
          if (!foregroundValue || !backgroundValue) throw new Error(`Missing token for ${key}`);
          return [key, +ratio(foregroundValue, backgroundValue).toFixed(2)];
        })));
      }, { mode, palette, groups });

      const label = `${mode}/${palette || 'default'}`;
      const minimums = {};
      for (const group of groups) {
        const values = group.pairs.map(([foreground, background]) => ({ pair: `${foreground}/${background}`, ratio: ratios[`${foreground}/${background}`] }));
        const worst = values.reduce((a, b) => a.ratio <= b.ratio ? a : b);
        minimums[group.name] = worst.ratio;
        for (const value of values) {
          if (value.ratio < group.min) failures.push(`${label}: ${value.pair} is ${value.ratio.toFixed(2)}, needs ${group.min}:1`);
        }
      }
      checks.push({ mode, palette: palette || 'default', minimums });
    }
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ checks, failures }, null, 2));
if (failures.length) {
  console.error(`Contrast audit failed:\n${failures.join('\n')}`);
  process.exitCode = 1;
}
