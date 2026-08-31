<h1 align="center">Lumin</h1>

<p align="center">一款为专注写作和日常知识管理打造的清透、安静、原生感十足的 Obsidian 主题。</p>

<p align="center">
  <a href="https://community.obsidian.md/themes/lumin"><img src="img/open-in-obsidian-button.svg" alt="在 Obsidian 中打开 Lumin" width="150"></a>
  <a href="https://ko-fi.com/yixuanhq"><img src="img/support-on-kofi-button.svg" alt="在 Ko-fi 支持 Lumin" width="150"></a>
</p>

![Lumin 主题预览](img/hero.png)

Lumin 让笔记始终位于工作区的视觉中心。清晰的层级、克制的留白和贴合平台的细节，让长时间写作更专注，也不牺牲笔记周边的操作效率。

[English README](README.md)

## 一览

- **统一的视觉语言。** macOS、Windows、Linux、Android 和移动端 Obsidian 共享 Mac 风格，仅根据设备调整密度与触控尺寸。
- **为阅读与写作而设。** 精心调整的排版、舒适的阅读宽度，以及对表格、Callout、嵌入、Banner、媒体和图片的优化，让笔记更易浏览。
- **让工作区保持安静。** 可通过悬停功能区和侧边栏、专注视图、紧凑面板操作区与居中标签，调整桌面端的工作方式。
- **无需编写 CSS 也可自定义。** 安装可选的 Style Settings 插件后，即可直接在 Obsidian 中调整外观、编辑器和辅助功能选项。

## 每块屏幕，一致的视觉语言

Lumin 在桌面、平板和手机上延续以内容为先的层级，同时完整支持浅色与深色外观。

![Lumin 在桌面、平板和手机上的界面](img/adaptive.png)

## 为笔记细节而设计

主题覆盖 Obsidian 工作区中每天都会用到的构成：元数据、标题、任务列表、Callout、代码、表格、图片和嵌入内容。

![深色模式下的 Lumin 组件展示](img/desktop.gif)

### 替代复选框

为任务状态提供紧凑、清晰的视觉表达，同时保持标准 Obsidian 任务项的行为。

![Lumin 复选框样式](img/checkbox.png)

## 安装

### 通过 Obsidian 安装

1. 打开“设置 > 外观 > 主题”。
2. 点击“管理”，搜索 **Lumin**，然后安装并启用主题。

### 手动安装

1. 从[最新发布版本](https://github.com/yixuan-space/obsidian-lumin/releases)下载 `manifest.json` 和 `theme.css`。
2. 在 Vault 中创建 `.obsidian/themes/Lumin/`。
3. 将两个文件放入该目录。
4. 打开 Obsidian 的“设置 > 外观 > 主题”，选择 **Lumin**。

## 自定义

安装 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) 社区插件后，可直接在 Obsidian 中调整 Lumin，无需编写 CSS。可用选项包括：

- 配色偏好，包括默认、雾蓝、苔绿和暖灰配色；每套均同步适配浅色与深色模式，并保留侧边栏着色及受支持 Android 设备上的动态配色。
- 桌面端行为，如悬停显示功能区与侧边栏、专注视图、标签对齐、紧凑面板操作区和媒体缩放。
- 编辑器偏好，如阅读宽度、块级与媒体宽度、Banner 样式、当前行高亮、链接下划线和图片对齐。
- 辅助功能选项，如动态效果、失焦对比变化、界面字号和图标尺寸。

## 开发

Lumin 需要 Obsidian `1.11.6` 或更高版本及 Node.js。SCSS 源文件位于 `src/`，根目录 `theme.css` 为最终主题文件。修改 SCSS 后运行：

```bash
npx --yes sass src/theme.scss theme.css --no-source-map
```

请将生成的 `theme.css` 与源文件改动一并提交。

## 致谢

Lumin 基于 [Cupertino](https://github.com/aaaaalexis/obsidian-cupertino)。其中包含来自 [Minimal](https://github.com/kepano/obsidian-minimal) 的 MIT 许可片段，以及来自 [Alternative Checkboxes Reference Set](https://github.com/damiankorcz/Alternative-Checkboxes-Reference-Set) 的公共领域参考内容。适用的署名和许可条款见[第三方声明](THIRD_PARTY_NOTICES.md)。

Craft 仅为视觉参考；本仓库不再分发其代码或素材。

## 许可证

YiXuan 对 Lumin 的原创贡献以 [MIT 许可证](LICENSE.txt) 发布；其中包含的第三方材料仍适用各自的条款，详见 [第三方声明](THIRD_PARTY_NOTICES.md)。
