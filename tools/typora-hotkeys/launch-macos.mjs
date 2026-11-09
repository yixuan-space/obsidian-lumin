import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const toolDirectory = fileURLToPath(new URL('.', import.meta.url));
const importer = path.join(toolDirectory, 'import-hotkeys.mjs');
const cancelled = '__LUMIN_CANCELLED__';

export const dialogSources = {
  select: 'set selectedItems to choose from list argv with title "Typora 快捷键工具" with prompt "请选择：" default items {item 1 of argv}\nif selectedItems is false then return "__LUMIN_CANCELLED__"\nreturn item 1 of selectedItems',
  folder: 'return POSIX path of (choose folder with prompt "选择 Obsidian 笔记库根目录（包含 .obsidian 的文件夹）")',
  config: 'set answer to display dialog "配置目录（通常保持 .obsidian）：" default answer ".obsidian" with title "Typora 快捷键工具" buttons {"取消", "继续"} default button "继续" cancel button "取消"\nreturn text returned of answer',
  confirm: 'set answer to display dialog (item 1 of argv) with title "Typora 快捷键工具" buttons {"取消", "继续"} default button "继续" cancel button "取消"\nreturn button returned of answer',
  message: 'display dialog (item 1 of argv) with title "Typora 快捷键工具" buttons {"好"} default button "好"',
  backup: 'return POSIX path of (choose file with prompt "选择当前笔记库中的 hotkeys.json.backup-* 备份" default location (POSIX file (item 1 of argv)))'
};

export function dialogProgram(source) {
  return `on run argv\ntry\n${source}\non error errorMessage number errorNumber\nif errorNumber is -128 then return "${cancelled}"\nerror errorMessage number errorNumber\nend try\nend run`;
}

function dialog(kind, args = []) {
  const result = spawnSync('/usr/bin/osascript', ['-', ...args], { input: dialogProgram(dialogSources[kind]), encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'macOS dialog failed.');
  const value = result.stdout.trimEnd();
  return value === cancelled ? null : value;
}

export function registeredVaults(registryFile = path.join(os.homedir(), 'Library/Application Support/obsidian/obsidian.json')) {
  if (!fs.existsSync(registryFile)) return [];
  const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8').replace(/^\uFEFF/, ''));
  return [...new Set(Object.values(registry.vaults || {}).map(entry => entry.path).filter(vault => typeof vault === 'string' && fs.existsSync(vault) && fs.statSync(vault).isDirectory()))];
}

function obsidianRunning() {
  const result = spawnSync('/usr/bin/pgrep', ['-x', 'Obsidian'], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (![0, 1].includes(result.status)) throw new Error('无法检查 Obsidian 是否正在运行。');
  return result.status === 0;
}

function invokeImporter(vault, config, options = []) {
  const result = spawnSync(process.execPath, [importer, '--vault', vault, '--config-dir', config, ...options], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.stdout) console.log(result.stdout.trimEnd());
  if (result.stderr) console.error(result.stderr.trimEnd());
  return result;
}

export function main(args = process.argv.slice(2)) {
  if (process.platform !== 'darwin') throw new Error('请在 macOS 上运行 Start.command；Windows 使用 Start.cmd。');
  if (args.includes('--check')) {
    JSON.parse(fs.readFileSync(path.join(toolDirectory, 'typora-hotkeys.json'), 'utf8'));
    if (!fs.existsSync(importer)) throw new Error('Importer not found.');
    console.log(JSON.stringify({ node: process.execPath, importer, vaults: registeredVaults() }, null, 2));
    return;
  }
  let vaults = [];
  try { vaults = registeredVaults(); } catch { console.log('无法读取已登记笔记库，请手动选择。'); }
  const manual = '手动选择其他笔记库…';
  let vault = vaults.length ? dialog('select', [...vaults, manual]) : manual;
  if (!vault) return;
  if (vault === manual) vault = dialog('folder');
  if (!vault) return;
  const config = dialog('config');
  if (!config) return;
  while (true) {
    const action = dialog('select', ['预览改动', '导入快捷键', '恢复备份', '退出']);
    if (!action || action === '退出') return;
    if (action === '预览改动') {
      const preview = invokeImporter(vault, config);
      dialog('message', preview.status === 0 ? ['预览完成，未修改配置。详细改动和冲突已显示在终端窗口。'] : ['预览失败，请查看终端中的错误与目录路径。']);
      continue;
    }
    if (obsidianRunning()) {
      dialog('message', ['请先完全退出 Obsidian（Command+Q），再选择导入或恢复。工具不会自动关闭应用。']);
      continue;
    }
    const options = ['--apply'];
    if (action === '恢复备份') {
      const configPath = path.resolve(vault, config);
      if (!fs.existsSync(configPath)) { dialog('message', ['配置目录不存在，请退出后重新选择。']); continue; }
      const backup = dialog('backup', [configPath]);
      if (!backup) continue;
      options.push('--restore', backup);
    }
    const confirmation = dialog('confirm', [`${action}\n笔记库：${vault}\n配置目录：${config}\n\n将更改快捷键文件；现有文件有改动时会自动备份，其他笔记库不受影响。`]);
    if (!confirmation) continue;
    if (obsidianRunning()) { dialog('message', ['Obsidian 已启动，请退出后重试。']); continue; }
    let result = invokeImporter(vault, config, options);
    if (result.status !== 0 && result.stderr.includes('Conflicting custom bindings found.')) {
      if (!dialog('confirm', ['发现自定义键位冲突（详见终端）。是否让 Typora 键位优先，移除其他命令中冲突的绑定？原配置会备份。'])) continue;
      if (obsidianRunning()) { dialog('message', ['Obsidian 已启动，请退出后重试。']); continue; }
      result = invokeImporter(vault, config, [...options, '--resolve-conflicts']);
    }
    dialog('message', result.status === 0
      ? ['已完成。改动前的备份位置显示在终端中，没有变化则不重复写入。现在可重新打开 Obsidian。']
      : ['操作未完成，请查看终端中的错误信息。']);
  }
}

if (process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  try { main(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
