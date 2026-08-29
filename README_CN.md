# Lumin

> 清透、安静、原生感十足的 Obsidian 主题。

![Lumin 主题预览](img/hero.png)

Lumin 面向写作、阅读和日常知识管理，通过清晰层级、克制留白和桌面/移动端适配，让笔记内容保持在视觉中心。

[English README](README.md)

## 特性

- 原生感界面：精致间距、圆角与交互反馈。
- 支持浅色、深色和系统自适应配色。
- 适配桌面与移动端布局。
- 支持 Style Settings 常用外观配置。
- 优化表格、图片、横幅、嵌入、卡片和复选框样式。

## 安装

1. 从[最新发布版本](https://github.com/yixuan-space/obsidian-lumin/releases)下载 `manifest.json` 和 `theme.css`。
2. 在 Vault 中创建 `.obsidian/themes/Lumin/`。
3. 将两个文件放入该目录。
4. 打开 Obsidian 的“设置 > 外观 > 主题”，选择 **Lumin**。

## 自定义

安装 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) 后，可调整侧边栏着色、自适应配色、悬停侧边栏、专注视图、阅读页面宽度、图片对齐和媒体缩放等选项。

## 开发

需要 Obsidian `1.11.6` 或更高版本及 Node.js。SCSS 源文件位于 `src/`，根目录 `theme.css` 为最终主题文件：

```bash
npx --yes sass src/theme.scss theme.css --no-source-map
```

## 许可证

Lumin 使用 [MIT 许可证](LICENSE.txt) 发布。
