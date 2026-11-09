# Typora 快捷键一键导入工具

Windows 双击本文件夹的 **Start.cmd**。在弹出的窗口中选择 Obsidian 笔记库，完全退出 Obsidian，再点击“导入快捷键”。可先点“预览改动”；需要恢复时点击“恢复备份”。

macOS 双击 **Start.command**。终端启动后会弹出系统对话框：选择已登记的笔记库（也可手动选文件夹），确认配置目录，再选择“预览改动”“导入快捷键”或“恢复备份”。导入和恢复前请用 **Command+Q** 完全退出 Obsidian。详细改动、错误和备份路径显示在终端中，退出菜单后按回车关闭终端窗口。

工具自动读取本机 Obsidian 的笔记库列表，也可以手动选择文件夹。默认配置目录为 `.obsidian`，使用其他配置目录时可在窗口中修改。不会自动关闭 Obsidian，也不会自动修改其他笔记库。

每次改动已有快捷键文件前都会自动备份；没有变化则不重复写入。遇到自定义键位冲突默认停止，检查预览后可勾选“让 Typora 键位优先”。

## 运行条件

- Windows 10/11，自带 Windows PowerShell 和 .NET 桌面组件；或 macOS，自带 Terminal、Bash 和 AppleScript 系统对话框。
- 已安装 Node.js 22 或更新的 LTS 版本；无需 `npm install`。Windows 也可以将可信来源的 `node.exe` 放入本文件夹；macOS 可放入适合 Apple Silicon / Intel 架构的 `node` 可执行文件。Mac 启动器会查找系统 PATH、`/opt/homebrew/bin` 和 `/usr/local/bin`，仅在交互终端可用的 Node 版本管理器可能需要先配置 PATH。
- Start.cmd 仅为本次启动指定 PowerShell 执行策略，不修改系统或用户的永久执行策略。组织管理的电脑仍可能禁止脚本运行。

### Mac 首次打开

Git 克隆会保留 `Start.command` 的可执行权限。ZIP 解压、网盘或跨设备复制可能丢失权限；若提示无法执行，在终端输入 `chmod +x `（末尾一个空格），把 `Start.command` 拖进去，按回车后再双击。

如果 macOS 因下载来源而阻止打开，确认文件来自本仓库后，按住 Control 点击文件，选择“打开”；部分系统需要到“系统设置 → 隐私与安全性”选择“仍要打开”。不需要关闭系统安全功能。本工具只读写你选择的笔记库配置，不使用管理员权限。

## 文件与多设备

整个 `typora-hotkeys` 文件夹可以复制到桌面、U 盘或其他电脑，路径可以包含空格和中文。Windows 保留 `Start.cmd`、`launch.ps1`、`import-hotkeys.mjs`、`typora-hotkeys.json`；Mac 保留 `Start.command`、`launch-macos.mjs`、`import-hotkeys.mjs`、`typora-hotkeys.json`。直接复制全部文件即可，测试文件无需运行。

同一个笔记库在多台设备使用时，可以同步 `.obsidian/hotkeys.json`，或开启 Obsidian Sync 的快捷键配置同步；不同笔记库则分别运行一次本工具。手机和平板通过配置同步接收键位，支持外接键盘的命令才会生效。

macOS 也可使用命令行；Linux 使用此方式。在本文件夹终端执行：

```sh
node import-hotkeys.mjs --vault "/path/to/vault"
node import-hotkeys.mjs --vault "/path/to/vault" --apply
```

`Mod` 在 Windows/Linux 为 Ctrl，在 macOS 为 Command。此方案基于 Typora Windows/Linux 键位；为解决冲突，会清空新建标签、切换注释、跳转标签 1–6、上一/下一标签的原键位，仍可从命令面板执行。插件未写入 hotkeys.json 的默认绑定无法离线检测，导入后可在 Obsidian 的快捷键设置中检查。
