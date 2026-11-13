import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const budgets = { raw: 330_000, gzip: 58_000 };
const css = await fs.readFile(path.join(root, 'theme.css'));
const sizes = { raw: css.length, gzip: gzipSync(css, { level: 9 }).length };

console.log(JSON.stringify({
  bytes: sizes,
  kilobytes: { raw: +(sizes.raw / 1000).toFixed(1), gzip: +(sizes.gzip / 1000).toFixed(1) },
  budgets,
}, null, 2));

const exceeded = Object.entries(budgets).filter(([name, budget]) => sizes[name] > budget);
if (exceeded.length) {
  console.error(`theme.css exceeds its size budget:\n${exceeded.map(([name, budget]) => `${name}: ${sizes[name]} > ${budget} bytes`).join('\n')}`);
  process.exitCode = 1;
}
