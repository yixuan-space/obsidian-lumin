#!/bin/bash

tool_dir="$(cd -- "$(dirname -- "$0")" && pwd)" || exit 1

if [ "$(uname -s)" != "Darwin" ]; then
  printf '%s\n' 'This launcher is for macOS. Use Start.cmd on Windows.'
  exit 1
fi

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
node_executable=""
if [ -x "$tool_dir/node" ]; then
  node_executable="$tool_dir/node"
elif command -v node >/dev/null 2>&1; then
  node_executable="$(command -v node)"
fi

if [ -z "$node_executable" ]; then
  /usr/bin/osascript -e 'display dialog "需要 Node.js 22 或更新的 LTS 版本。请安装后重新双击 Start.command，无需安装 npm 依赖。也可将适合本机架构的 node 可执行文件放在工具文件夹内。" with title "Typora 快捷键工具" buttons {"好"} default button "好"'
  exit 1
fi

"$node_executable" "$tool_dir/launch-macos.mjs"
tool_status=$?
printf '\n%s\n' '按回车关闭此窗口 / Press Return to close.'
read -r unused_input
exit "$tool_status"
