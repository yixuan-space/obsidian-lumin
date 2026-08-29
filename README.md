# Lumin

> 清透、安静、原生感十足的 Obsidian 主题。

![Lumin theme preview](img/hero.png)

Lumin 为写作、阅读和日常知识管理而设计。它以清晰的层级、克制的留白和适配不同设备的界面为核心，让笔记内容保持在视觉中心。

![Desktop preview](img/desktop.png)

## 特性

- 原生感界面：精致的间距、圆角、层级和交互反馈。
- 桌面与移动端适配：针对触控操作和窄屏布局优化。
- 自适应配色：支持浅色、深色及按系统环境调整的颜色方案。
- 专注写作：可收起侧边栏、简化标签栏，并提供专注视图。
- Style Settings：可在 Obsidian 设置中调整常用界面选项。
- 笔记增强：包含横幅、图片缩放与滤镜、卡片、表格、嵌入内容和替代复选框样式。

![Mobile preview](img/mobile.png)

## 安装

### 从 GitHub 安装

1. 下载 [最新发布版本](https://github.com/yixuan-space/obsidian-lumin/releases)中的 `manifest.json` 和 `theme.css`。
2. 在你的 Vault 中创建目录：`.obsidian/themes/Lumin/`。
3. 将两个文件放入该目录。
4. 打开 Obsidian 的“设置 -> 外观 -> 主题”，选择 `Lumin`。

### 通过 Git 保持更新

将仓库克隆到主题目录：

```bash
git clone https://github.com/yixuan-space/obsidian-lumin.git "/path/to/your-vault/.obsidian/themes/Lumin"
```

以后在该目录执行以下命令，即可获取仓库中的最新主题文件：

```bash
git pull
```

完成拉取后，重启 Obsidian 或在外观设置中重新选择一次 Lumin 主题。

## 自定义

安装 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) 社区插件后，可在“设置 -> 外观 -> Style Settings -> Lumin”中调整界面选项，例如侧边栏着色、动态配色、悬停侧边栏、专注视图和媒体缩放。

Lumin 也支持以下笔记样式能力：

- `banner`、`banner-fade`、`banner-icon`：为笔记添加横幅与图标。
- `wide`、`max`、`table-100`：调整笔记、表格或图片的显示宽度。
- `cards`、`list-cards`：将 Dataview 表格或列表转为卡片布局。
- `embed-strict`、`embed-hide-title`：精简嵌入内容的外观。
- `#blend`、`#invert`、`#circle`、`#outline`：控制图片展示效果。

替代复选框样式预览：

![Alternate checkbox preview](img/checkbox.png)

## 开发

要求：Obsidian `1.11.6` 或更高版本，以及 Node.js。

样式源文件位于 `src/`，Obsidian 实际读取根目录中的 `theme.css`。修改 SCSS 后，运行：

```bash
npx --yes sass src/theme.scss theme.css --no-source-map
```

提交前请确认 `theme.css` 已重新生成，并一并提交源文件与构建产物。

## 致谢

Lumin 基于 [Cupertino](https://github.com/aaaaalexis/obsidian-cupertino) 二次开发，保留其 MIT 许可证及原始版权声明。

- [Craft Docs](https://www.craft.do/)：界面设计灵感。
- [Minimal](https://github.com/kepano/obsidian-minimal)：图片滤镜、表格辅助类和 Dataview 卡片相关实现参考。
- [Alternative Checkboxes Reference Set](https://github.com/damiankorcz/Alternative-Checkboxes-Reference-Set)：替代复选框参考。
- [Yushan Main East Peak](https://commons.wikimedia.org/wiki/File:Yushan_main_east_peak%2BHuang_Chung_Yu%E9%BB%83%E4%B8%AD%E4%BD%91%2B9030.png)：预览图背景来源。

## 许可证

Lumin 使用 [MIT 许可证](LICENSE.txt)发布。根据原项目许可证要求，`LICENSE.txt` 中保留了原作者的版权声明。
