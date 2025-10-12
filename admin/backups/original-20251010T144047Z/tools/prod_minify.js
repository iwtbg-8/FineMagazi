#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const terser = require('terser');
const csso = require('csso');

async function walk(dir) {
  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const res = path.resolve(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'backups') continue;
      files = files.concat(await walk(res));
    } else {
      files.push(res);
    }
  }
  return files;
}

function isMinified(file) {
  return file.endsWith('.min.js') || file.endsWith('.min.css');
}

async function minifyJs(file) {
  const code = await fs.readFile(file, 'utf8');
  const res = await terser.minify(code, { compress: true, mangle: true });
  if (res.error) throw res.error;
  const outPath = file.replace(/\.js$/, '.min.js');
  await fs.writeFile(outPath, res.code, 'utf8');
  console.log('JS ->', outPath);
}

async function minifyCss(file) {
  const code = await fs.readFile(file, 'utf8');
  const res = csso.minify(code).css;
  const outPath = file.replace(/\.css$/, '.min.css');
  await fs.writeFile(outPath, res, 'utf8');
  console.log('CSS ->', outPath);
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const files = await walk(root);
  let count = 0;
  for (const f of files) {
    if (isMinified(f)) continue;
    if (f.endsWith('.js')) {
      try { await minifyJs(f); count++; } catch (e) { console.error('JS failed', f, e); }
    } else if (f.endsWith('.css')) {
      try { await minifyCss(f); count++; } catch (e) { console.error('CSS failed', f, e); }
    }
  }
  console.log(`Done. Minified ${count} files.`);
}

main().catch(e => { console.error(e); process.exit(1); });
