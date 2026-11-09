import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const profilePath = fileURLToPath(new URL('./typora-hotkeys.json', import.meta.url));

function validateProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('Hotkeys must be a JSON object.');
  for (const [command, bindings] of Object.entries(profile)) {
    if (!command.includes(':') || !Array.isArray(bindings)) throw new Error(`Invalid hotkey command: ${command}`);
    for (const binding of bindings) {
      if (!binding || typeof binding.key !== 'string' || !binding.key || !Array.isArray(binding.modifiers) ||
          binding.modifiers.some(modifier => !['Mod', 'Ctrl', 'Meta', 'Alt', 'Shift'].includes(modifier))) {
        throw new Error(`Invalid binding for ${command}`);
      }
    }
  }
  return profile;
}

function signature(binding, platform) {
  const modifiers = binding.modifiers.map(modifier => modifier === 'Mod' ? platform === 'darwin' ? 'Meta' : 'Ctrl' : modifier);
  return `${[...new Set(modifiers)].sort().join('+')}+${binding.key.toUpperCase()}`;
}

export function mergeHotkeys(current, profile, platform = process.platform) {
  validateProfile(current);
  validateProfile(profile);
  const merged = { ...current, ...profile };
  const assigned = new Map();
  for (const [command, bindings] of Object.entries(profile)) {
    for (const binding of bindings) {
      const key = signature(binding, platform);
      if (assigned.has(key) && assigned.get(key) !== command) throw new Error(`Profile assigns ${key} twice.`);
      assigned.set(key, command);
    }
  }
  const conflicts = [];
  for (const [command, bindings] of Object.entries(current)) {
    if (Object.hasOwn(profile, command)) continue;
    merged[command] = bindings.filter(binding => {
      const owner = assigned.get(signature(binding, platform));
      if (!owner) return true;
      conflicts.push({ command, assignedTo: owner, binding });
      return false;
    });
  }
  return { merged, conflicts };
}

function readJson(filename) {
  return validateProfile(JSON.parse(fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, '')));
}

function writeWithBackup(target, content) {
  const exists = fs.existsSync(target);
  if (exists && fs.lstatSync(target).isSymbolicLink()) throw new Error('Refusing to replace a symlink.');
  if (exists && fs.readFileSync(target, 'utf8') === content) return { changed: false };
  const backup = exists ? `${target}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}` : null;
  if (backup) fs.copyFileSync(target, backup, fs.constants.COPYFILE_EXCL);
  const temporary = `${target}.tmp-${randomUUID()}`;
  try {
    fs.writeFileSync(temporary, content, { flag: 'wx' });
    fs.renameSync(temporary, target);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return { changed: true, backup };
}

export function run(args) {
  const valueOptions = new Set(['--vault', '--config-dir', '--restore']);
  const flagOptions = new Set(['--apply', '--resolve-conflicts', '--help']);
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const option = args[index];
    if (valueOptions.has(option)) {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Missing value for ${option}`);
      options[option] = args[++index];
    } else if (flagOptions.has(option)) options[option] = true;
    else throw new Error(`Unknown option: ${option}`);
  }
  if (options['--help'] || !options['--vault']) {
    console.log('Usage: node import-hotkeys.mjs --vault <path> [--config-dir .obsidian] [--apply] [--resolve-conflicts] [--restore <backup>]');
    console.log('Without --apply, only preview changes. Close Obsidian before applying.');
    return;
  }
  const vault = fs.realpathSync(path.resolve(options['--vault']));
  const config = fs.realpathSync(path.resolve(vault, options['--config-dir'] || '.obsidian'));
  const relative = path.relative(vault, config);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Config directory must be inside the vault.');
  const target = path.join(config, 'hotkeys.json');
  const current = fs.existsSync(target) ? readJson(target) : {};
  if (options['--restore']) {
    const backup = fs.realpathSync(path.resolve(options['--restore']));
    if (path.dirname(backup) !== config || !path.basename(backup).startsWith('hotkeys.json.backup-')) throw new Error('Restore requires a hotkeys backup in this vault config directory.');
    const content = JSON.stringify(readJson(backup), null, 2) + '\n';
    console.log(JSON.stringify({ target, restoreFrom: backup, ...(options['--apply'] ? writeWithBackup(target, content) : { preview: true }) }, null, 2));
    return;
  }
  const profile = readJson(profilePath);
  const { merged, conflicts } = mergeHotkeys(current, profile);
  const changedCommands = Object.keys(merged).filter(command => JSON.stringify(current[command]) !== JSON.stringify(merged[command]));
  console.log(JSON.stringify({ target, changedCommands, conflicts, preview: !options['--apply'] }, null, 2));
  if (!options['--apply']) return;
  if (conflicts.length && !options['--resolve-conflicts']) throw new Error('Conflicting custom bindings found. Review preview, then use --resolve-conflicts to remove only those bindings.');
  if (!changedCommands.length) return console.log('Already up to date.');
  console.log(JSON.stringify(writeWithBackup(target, JSON.stringify(merged, null, 2) + '\n'), null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
