# Typora 风格快捷键与多设备使用

主题 CSS 只能改变外观。快捷键由 Obsidian 的 `.obsidian/hotkeys.json` 控制，本仓库提供独立配置和跨平台 Node.js 导入脚本，无需安装社区插件。

Windows 推荐直接打开 `tools/typora-hotkeys` 文件夹，双击 `Start.cmd`，选择笔记库后点击“导入快捷键”。支持预览与恢复备份。整个文件夹可独立复制到其他电脑；电脑需有 Node.js，无需 npm 依赖。详见[双击工具说明](../tools/typora-hotkeys/README.md)。

Mac 双击同文件夹的 `Start.command`，按系统对话框选择笔记库、配置目录和操作。请先用 Command+Q 退出 Obsidian；预览、导入结果和备份路径会显示在终端。需要 Node.js 22 或更新的 LTS 版本。首次使用的执行权限和 macOS 下载提示处理见[工具说明中的 Mac 首次打开](../tools/typora-hotkeys/README.md#mac-首次打开)。

## 导入

安装 Node.js，在仓库目录运行。脚本不依赖 npm 安装。

```powershell
node tools/typora-hotkeys/import-hotkeys.mjs --vault "D:\ComputerNote"
```

默认只预览改动与自定义键位冲突。关闭这个 Vault 的 Obsidian 窗口，再应用：

```powershell
node tools/typora-hotkeys/import-hotkeys.mjs --vault "D:\ComputerNote" --apply
```

如果报告其他命令已占用相同按键，检查预览后可加 `--resolve-conflicts`。它仅移除冲突的绑定，保留该命令的其他键位。每次实际更新前都会在同目录生成 `hotkeys.json.backup-时间-唯一标识`，重复导入相同配置不会重复备份。自定义配置目录可通过 `--config-dir` 指定，目录必须位于 Vault 内。

恢复备份同样先预览，再加 `--apply`，当前配置会再次备份：

```powershell
node tools/typora-hotkeys/import-hotkeys.mjs --vault "D:\ComputerNote" --restore "D:\ComputerNote\.obsidian\hotkeys.json.backup-实际文件名" --apply
```

## 包含的键位

以 Typora Windows/Linux 默认键位为基础。`Mod` 在 Windows/Linux 为 Ctrl，在 macOS 为 Command；这提供统一的肌肉记忆，不代表完全复刻 Typora macOS 独立键位。

| 功能 | Windows/Linux | macOS 本方案 |
| --- | --- | --- |
| 标题 1–6 / 正文 | Ctrl+1…6 / Ctrl+0 | Command+1…6 / Command+0 |
| 加粗 / 斜体 | Ctrl+B / Ctrl+I | Command+B / Command+I |
| 删除线 | Alt+Shift+5 | Option+Shift+5 |
| 行内代码 | Ctrl+Shift+反引号 | Command+Shift+反引号 |
| 代码块 / 数学块 | Ctrl+Shift+K / Ctrl+Shift+M | Command+Shift+K / Command+Shift+M |
| 引用 | Ctrl+Shift+Q | Command+Shift+Q |
| 有序 / 无序列表 | Ctrl+Shift+[ / Ctrl+Shift+] | Command+Shift+[ / Command+Shift+] |
| 插入链接 / 表格 | Ctrl+K / Ctrl+T | Command+K / Command+T |
| 实时预览与源码切换 | Ctrl+/ | Command+/ |
| 搜索 / 替换 / 保存 | Ctrl+F / Ctrl+H / Ctrl+S | Command+F / Command+H / Command+S |

为了避免默认命令冲突，本方案清空“新建标签页”“切换注释”“跳转标签页 1–6”“上一个/下一个标签页”的快捷键覆盖。macOS 的标签切换与列表快捷键存在冲突，因此统一禁用这两个切换命令的键位。它们仍可从命令面板执行，也可在设置中另行绑定。

键位以 `tools/typora-hotkeys/typora-hotkeys.json` 为准，导入会替换本方案涉及的命令绑定，其余自定义命令会保留。脚本检查 `hotkeys.json` 内的自定义冲突；插件未显式写入该文件的默认快捷键无法离线检测，导入后可在“设置 → 快捷键”查看冲突提示。键盘布局和输入法可能影响方括号或反引号组合。

Obsidian 没有与 Typora 完全等价的下划线、某些段落操作和模式切换命令，因此不为这些功能添加无效绑定。源码切换在笔记编辑模式下可用；表格、数学块等命令也受当前编辑上下文限制。

## 多设备同步

同一个 Vault：如果使用 Obsidian Sync，在各设备启用 Vault 配置同步中的快捷键选项，并确认使用相同配置目录。其他同步工具需要明确包含隐藏目录 `.obsidian`，至少同步 `hotkeys.json`；先完成一台设备的修改和同步，再打开另一台，避免同时覆盖。备份文件无需跨设备同步。

不同 Vault：复制整个 `tools/typora-hotkeys` 文件夹，在每台设备对目标 Vault 运行工具。仅复制主题文件不会带入快捷键。

手机和平板：不必运行 Node.js，可通过同 Vault 的配置同步接收快捷键。外接键盘时，只有平台与当前界面支持的命令才可触发；这些设置不会自动创建触屏按钮。若设备使用单独配置目录，需要分别同步/导入。

参考：[Typora 官方快捷键文档](https://support.typora.io/Shortcut-Keys/)。
