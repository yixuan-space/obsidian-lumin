<h1 align="center">Lumin</h1>

<p align="center">一款为专注写作和日常知识管理打造的安静、清透且具有原生感的 Obsidian 主题。</p>

<p align="center">
  <a href="https://community.obsidian.md/themes/lumin"><img src="img/open-in-obsidian-button.svg" alt="在 Obsidian 中打开 Lumin" width="150"></a>
  <a href="https://ko-fi.com/yixuanhq"><img src="img/support-on-kofi-button.svg" alt="在 Ko-fi 支持 Lumin" width="150"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/v/release/yixuan-space/obsidian-lumin?style=flat-square&label=version&color=7c3aed" alt="最新版本">
  <img src="https://img.shields.io/github/downloads/yixuan-space/obsidian-lumin/total?style=flat-square&logo=obsidian&logoColor=white&label=downloads&color=3d79b7" alt="下载量">
  <img src="https://img.shields.io/github/license/yixuan-space/obsidian-lumin?style=flat-square&label=license&color=4f8a10" alt="MIT 许可证">
</p>

<p align="center"><a href="README.md">English</a></p>

![Lumin 主题预览](img/hero.png)

Lumin 让笔记始终位于工作区的视觉中心。清晰的层级、克制的留白和贴合平台的细节，让长时间写作更专注，也不牺牲笔记周边的操作效率。

## 亮点

- **以内容为先的工作区。** 舒适的阅读宽度、经过调整的排版与明确的层级，适合写作、复盘和查阅。
- **完整的笔记表面。** 元数据、表格、Callout、代码、任务、嵌入、Banner、图片和媒体均有统一而克制的样式。
- **需要时才出现的桌面控件。** 悬停功能区和侧边栏、专注视图、紧凑面板操作区与居中标签，使宽屏工作区保持灵活。
- **无需编写 CSS 也可自定义。** 可选的 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) 提供配色、编辑器、桌面行为和辅助功能选项。

## 跨设备体验

Lumin 在所有 Obsidian 平台上延续同一套视觉语言，同时根据设备调整密度、导航、安全区和触控尺寸。

| 平台 | Lumin 的适配方式 |
| --- | --- |
| macOS、Windows、Linux | 感知窗口状态的表面、标签、侧边栏与桌面交互 |
| iPad 和 Android 平板 | 触控尺寸、灵活抽屉与适合平板的设置布局 |
| iPhone 和 Android 手机 | 感知安全区的导航、底部面板、抽屉和移动控件 |

![Lumin 在桌面、平板和手机上的界面](img/adaptive.png)

## 为笔记细节而设计

主题让每天都会用到的笔记组件更容易浏览，同时保持一致的视觉系统。

![深色模式下的 Lumin 组件展示](img/desktop.gif)

替代复选框为任务状态提供紧凑、清晰的表达，同时保留标准 Obsidian 任务项的行为。

![Lumin 复选框样式](img/checkbox.png)

## 安装

### 通过 Obsidian 安装

1. 打开“设置 > 外观 > 主题”。
2. 点击“管理”，搜索 **Lumin**，然后安装并启用主题。

### 手动安装

1. 从[最新发布版本](https://github.com/yixuan-space/obsidian-lumin/releases)下载 `manifest.json` 和 `theme.css`。
2. 在 Vault 中创建 `.obsidian/themes/Lumin/`。
3. 将两个文件放入该目录。
4. 在“设置 > 外观 > 主题”中选择 **Lumin**。

## 自定义

安装 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) 后，即可在 Obsidian 设置中调整 Lumin。

- 在默认、雾蓝、苔绿和暖灰配色之间选择，并同步适配浅色与深色外观。
- 调整悬停功能区、悬停侧边栏、专注视图、标签对齐、紧凑面板操作区和媒体缩放等桌面行为。
- 设置阅读宽度、块级与媒体宽度、Banner 样式、当前行高亮、链接下划线和图片对齐。
- 减少动态效果、减弱失焦对比变化，或微调界面和图标尺寸。

## 兼容性

Lumin 需要 Obsidian `1.11.6` 或更高版本，支持 macOS、Windows、Linux、Android 和 iOS 的浅色与深色外观。主题会在宿主提供相应设备和窗口类时采用平台专属行为。

## 开发

SCSS 源文件位于 `src/`，根目录 `theme.css` 是可发布主题文件。安装 Node.js 后，修改 SCSS 可运行：

```bash
npx --yes sass src/theme.scss theme.css --no-source-map
```

请将生成的 `theme.css` 与源文件改动一并提交；发布或提交 PR 前建议运行 `git diff --check`。

## 致谢

Lumin 基于 [Cupertino](https://github.com/aaaaalexis/obsidian-cupertino)。其中包含来自 [Minimal](https://github.com/kepano/obsidian-minimal) 的 MIT 许可片段，以及来自 [Alternative Checkboxes Reference Set](https://github.com/damiankorcz/Alternative-Checkboxes-Reference-Set) 的公共领域参考内容。适用的署名和许可条款见[第三方声明](THIRD_PARTY_NOTICES.md)。

Craft 仅为视觉参考；本仓库不再分发其代码或素材。

## 许可证

YiXuan 对 Lumin 的原创贡献以 [MIT 许可证](LICENSE) 发布；其中包含的第三方材料仍适用各自的条款，详见[第三方声明](THIRD_PARTY_NOTICES.md)。
