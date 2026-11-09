import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { mergeHotkeys } from './import-hotkeys.mjs';
import { dialogProgram, dialogSources, registeredVaults } from './launch-macos.mjs';

const importer = fileURLToPath(new URL('./import-hotkeys.mjs', import.meta.url));

test('merge preserves unrelated bindings and resolves Mod against native modifiers', () => {
  const current = { 'custom:one': [{ modifiers: ['Ctrl'], key: 't' }, { modifiers: ['Alt'], key: 'T' }] };
  const profile = { 'editor:insert-table': [{ modifiers: ['Mod'], key: 'T' }] };
  const result = mergeHotkeys(current, profile, 'win32');
  assert.equal(result.conflicts.length, 1);
  assert.deepEqual(result.merged['custom:one'], [{ modifiers: ['Alt'], key: 'T' }]);
  assert.equal(current['custom:one'].length, 2);
  assert.equal(mergeHotkeys(current, profile, 'darwin').conflicts.length, 0);
  assert.equal(mergeHotkeys({ 'custom:one': [{ modifiers: ['Meta'], key: 'T' }] }, profile, 'darwin').conflicts.length, 1);
});

test('preview does not write; apply backs up; repeated apply is idempotent; restore works', () => {
  const vault = fs.mkdtempSync(path.join(os.tmpdir(), 'lumin-hotkeys-'));
  const config = path.join(vault, '.obsidian');
  fs.mkdirSync(config);
  const target = path.join(config, 'hotkeys.json');
  const original = { 'custom:one': [{ modifiers: ['Alt'], key: 'Z' }] };
  fs.writeFileSync(target, JSON.stringify(original));
  const invoke = (...args) => execFileSync(process.execPath, [importer, '--vault', vault, ...args], { encoding: 'utf8' });
  try {
    invoke();
    assert.deepEqual(JSON.parse(fs.readFileSync(target)), original);
    assert.equal(fs.readdirSync(config).length, 1);
    invoke('--apply');
    const backup = fs.readdirSync(config).find(name => name.startsWith('hotkeys.json.backup-'));
    assert.ok(backup);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(config, backup))), original);
    assert.deepEqual(JSON.parse(fs.readFileSync(target))['custom:one'], original['custom:one']);
    invoke('--apply');
    assert.equal(fs.readdirSync(config).length, 2);
    invoke('--restore', path.join(config, backup), '--apply');
    assert.deepEqual(JSON.parse(fs.readFileSync(target)), original);
  } finally {
    for (const entry of fs.readdirSync(config)) fs.unlinkSync(path.join(config, entry));
    fs.rmdirSync(config);
    fs.rmdirSync(vault);
  }
});

test('custom collisions stop an apply without changing the file', () => {
  const vault = fs.mkdtempSync(path.join(os.tmpdir(), 'lumin-hotkeys-conflict-'));
  const config = path.join(vault, '.obsidian');
  fs.mkdirSync(config);
  const target = path.join(config, 'hotkeys.json');
  const original = JSON.stringify({ 'custom:table': [{ modifiers: ['Mod'], key: 'T' }] });
  fs.writeFileSync(target, original);
  try {
    assert.throws(() => execFileSync(process.execPath, [importer, '--vault', vault, '--apply'], { stdio: 'pipe' }));
    assert.equal(fs.readFileSync(target, 'utf8'), original);
    assert.equal(fs.readdirSync(config).length, 1);
    execFileSync(process.execPath, [importer, '--vault', vault, '--apply', '--resolve-conflicts'], { stdio: 'pipe' });
    assert.deepEqual(JSON.parse(fs.readFileSync(target))['custom:table'], []);
    assert.ok(fs.readdirSync(config).some(entry => entry.startsWith('hotkeys.json.backup-')));
  } finally {
    for (const entry of fs.readdirSync(config)) fs.unlinkSync(path.join(config, entry));
    fs.rmdirSync(config);
    fs.rmdirSync(vault);
  }
});

test('copied tool works independently from paths containing spaces and Chinese', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lumin-portable-'));
  const tool = path.join(temporary, '快捷键 tool');
  const vault = path.join(temporary, '笔记 vault');
  const config = path.join(vault, '.obsidian');
  fs.mkdirSync(tool);
  fs.mkdirSync(config, { recursive: true });
  try {
    fs.copyFileSync(importer, path.join(tool, 'import-hotkeys.mjs'));
    fs.copyFileSync(fileURLToPath(new URL('./typora-hotkeys.json', import.meta.url)), path.join(tool, 'typora-hotkeys.json'));
    execFileSync(process.execPath, [path.join(tool, 'import-hotkeys.mjs'), '--vault', vault, '--apply'], { cwd: temporary });
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(config, 'hotkeys.json')))['editor:set-heading-1'], [{ modifiers: ['Mod'], key: '1' }]);
  } finally {
    for (const entry of fs.readdirSync(config)) fs.unlinkSync(path.join(config, entry));
    for (const entry of fs.readdirSync(tool)) fs.unlinkSync(path.join(tool, entry));
    fs.rmdirSync(config);
    fs.rmdirSync(vault);
    fs.rmdirSync(tool);
    fs.rmdirSync(temporary);
  }
});

test('macOS vault discovery filters missing paths and deduplicates entries', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lumin-mac-vaults-'));
  const registry = path.join(temporary, 'obsidian.json');
  const vault = path.join(temporary, '笔记 vault');
  fs.mkdirSync(vault);
  try {
    fs.writeFileSync(registry, JSON.stringify({ vaults: { one: { path: vault }, two: { path: vault }, missing: { path: path.join(temporary, 'absent') } } }));
    assert.deepEqual(registeredVaults(registry), [vault]);
    assert.deepEqual(registeredVaults(path.join(temporary, 'absent.json')), []);
  } finally {
    fs.unlinkSync(registry);
    fs.rmdirSync(vault);
    fs.rmdirSync(temporary);
  }
});

test('CLI runs when its entry path contains a symbolic link', { skip: process.platform === 'win32' }, () => {
  const temporary = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'lumin-symlink-')));
  const actual = path.join(temporary, 'actual');
  const alias = path.join(temporary, 'alias');
  const vault = path.join(actual, 'vault');
  const config = path.join(vault, '.obsidian');
  fs.mkdirSync(config, { recursive: true });
  fs.copyFileSync(importer, path.join(actual, 'import-hotkeys.mjs'));
  fs.copyFileSync(fileURLToPath(new URL('./typora-hotkeys.json', import.meta.url)), path.join(actual, 'typora-hotkeys.json'));
  fs.symlinkSync(actual, alias, 'dir');
  try {
    execFileSync(process.execPath, [path.join(alias, 'import-hotkeys.mjs'), '--vault', vault, '--apply']);
    assert.ok(fs.existsSync(path.join(config, 'hotkeys.json')));
  } finally {
    fs.unlinkSync(alias);
    for (const entry of fs.readdirSync(config)) fs.unlinkSync(path.join(config, entry));
    fs.rmdirSync(config);
    fs.rmdirSync(vault);
    fs.unlinkSync(path.join(actual, 'import-hotkeys.mjs'));
    fs.unlinkSync(path.join(actual, 'typora-hotkeys.json'));
    fs.rmdirSync(actual);
    fs.rmdirSync(temporary);
  }
});

test('macOS AppleScript dialogs compile without opening windows', { skip: process.platform !== 'darwin' }, () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lumin-applescript-'));
  try {
    for (const [name, source] of Object.entries(dialogSources)) {
      execFileSync('/usr/bin/osacompile', ['-o', path.join(temporary, `${name}.scpt`), '-'], { input: dialogProgram(source) });
    }
  } finally {
    for (const entry of fs.readdirSync(temporary)) fs.unlinkSync(path.join(temporary, entry));
    fs.rmdirSync(temporary);
  }
});
