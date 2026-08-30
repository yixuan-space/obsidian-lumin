<h1 align="center">Lumin</h1>

> A clean, calm, native-feeling Obsidian theme.

<p align="center">
  <img src="https://img.shields.io/github/downloads/yixuan-space/obsidian-lumin/total?style=flat-square&logo=obsidian&logoColor=white&label=downloads&color=7c3aed" alt="Downloads">
  <img src="https://img.shields.io/github/stars/yixuan-space/obsidian-lumin?style=flat-square&logo=github&label=stars&color=3d79b7" alt="GitHub stars">
  <img src="https://img.shields.io/github/last-commit/yixuan-space/obsidian-lumin?style=flat-square&label=last%20commit&color=4f8a10" alt="Last commit">
</p>

![Lumin theme preview](img/hero.png)

Lumin is designed for writing, reading, and everyday knowledge management. It keeps notes at the center with a clear visual hierarchy, restrained spacing, and responsive desktop and mobile layouts.



<p align="center">
  <a href="https://community.obsidian.md/themes/lumin"><img src="img/open-in-obsidian-button.svg" alt="Open in Obsidian" width="200"></a>
  <a href="https://ko-fi.com/yixuanhq"><img src="img/support-on-kofi-button.svg" alt="Support Lumin on Ko-fi" width="200"></a>
</p>

[简体中文说明](README_CN.md)

## Highlights

- Native-inspired interface with refined spacing, rounded corners, and subtle interaction feedback.
- Light and dark color schemes with adaptive system styling.
- Responsive desktop and mobile layouts.
- Style Settings controls for common appearance preferences.
- Enhanced note styling for tables, media, banners, embeds, cards, and checkboxes.

### Custom checkboxes

![Lumin checkbox styles](img/checkbox.png)

## Installation

1. Download `manifest.json` and `theme.css` from the [latest release](https://github.com/yixuan-space/obsidian-lumin/releases).
2. Create `.obsidian/themes/Lumin/` in your vault.
3. Place both files in that directory.
4. In Obsidian, open **Settings > Appearance > Themes** and select **Lumin**.

## Customization

Install the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) community plugin to configure interface preferences such as sidebar tinting, adaptive colors, hover sidebars, focus view, reading width, image alignment, and media zoom.

## Development

Requires Obsidian `1.11.6` or later and Node.js.

Source styles are in `src/`; Obsidian loads the root `theme.css`. After changing SCSS, rebuild the theme:

```bash
npx --yes sass src/theme.scss theme.css --no-source-map
```

Commit the generated `theme.css` together with source changes.

## Credits

Lumin is based on [Cupertino](https://github.com/aaaaalexis/obsidian-cupertino) and retains its MIT license and copyright notice. It also draws inspiration from [Craft](https://www.craft.do/) and [Minimal](https://github.com/kepano/obsidian-minimal).

## License

Lumin is released under the [MIT License](LICENSE.txt).
