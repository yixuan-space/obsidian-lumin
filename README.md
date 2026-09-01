<h1 align="center">Lumin</h1>

<p align="center">A calm, native-feeling Obsidian theme for focused writing and everyday knowledge work.</p>

<p align="center">
  <a href="https://community.obsidian.md/themes/lumin"><img src="img/open-in-obsidian-button.svg" alt="Open Lumin in Obsidian" width="150"></a>
  <a href="https://ko-fi.com/yixuanhq"><img src="img/support-on-kofi-button.svg" alt="Support Lumin on Ko-fi" width="150"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/v/release/yixuan-space/obsidian-lumin?style=flat-square&label=version&color=7c3aed" alt="Latest release">
  <img src="https://img.shields.io/github/downloads/yixuan-space/obsidian-lumin/total?style=flat-square&logo=obsidian&logoColor=white&label=downloads&color=3d79b7" alt="Downloads">
  <img src="https://img.shields.io/github/license/yixuan-space/obsidian-lumin?style=flat-square&label=license&color=4f8a10" alt="MIT License">
</p>

<p align="center"><a href="README_CN.md">简体中文</a></p>

![Lumin theme preview](img/hero.png)

Lumin keeps the note at the center of the workspace. Its measured spacing, clear hierarchy, and platform-aware details make long writing sessions feel quieter without hiding the tools that support them.

## Highlights

- **Content-first workspace.** Comfortable reading width, refined typography, and deliberate hierarchy for writing, review, and reference.
- **A complete note surface.** Thoughtful styling for properties, tables, callouts, code, tasks, embeds, banners, images, and media.
- **Desktop controls when you need them.** Hoverable ribbons and sidebars, focus view, compact panel actions, and centered tabs keep wide workspaces adaptable.
- **Configure without CSS.** Optional [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) controls cover color, editor, desktop behavior, and accessibility preferences.

## Across Devices

Lumin shares one visual language across every Obsidian platform while adapting density, navigation, safe-area spacing, and touch targets to the device.

| Platform | Lumin adapts |
| --- | --- |
| macOS, Windows, Linux | Window-aware surfaces, tabs, sidebars, and desktop interactions |
| iPad and Android tablets | Touch-sized controls, flexible drawers, and tablet settings layouts |
| iPhone and Android phones | Safe-area-aware navigation, sheets, drawers, and mobile controls |

![Lumin across desktop, tablet, and phone](img/adaptive.png)

## Note Details

The theme makes everyday note components easier to scan without turning them into separate visual systems.

![Lumin component gallery in dark mode](img/desktop.gif)

Alternative checkbox states add a compact vocabulary for tasks while preserving standard Obsidian task behavior.

![Lumin checkbox styles](img/checkbox.png)

## Install

### From Obsidian

1. Open **Settings > Appearance > Themes**.
2. Select **Manage**, search for **Lumin**, then install and enable it.

### Manual Install

1. Download `manifest.json` and `theme.css` from the [latest release](https://github.com/yixuan-space/obsidian-lumin/releases).
2. Create `.obsidian/themes/Lumin/` in your vault.
3. Put both files in that directory.
4. In **Settings > Appearance > Themes**, select **Lumin**.

## Customize

Install [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) to adjust Lumin from Obsidian's settings interface.

- Choose the default, mist blue, moss green, or warm gray palette in light and dark appearance.
- Tune desktop behavior, including hover ribbons, hover sidebars, focus view, tab alignment, compact panel actions, and media zoom.
- Adjust reading width, block and media width, banner treatment, active-line highlight, link underlines, and image alignment.
- Reduce motion, soften unfocused contrast changes, or adjust interface and icon sizing.

## Compatibility

Lumin requires Obsidian `1.11.6` or later. It supports light and dark appearance on macOS, Windows, Linux, Android, and iOS. Platform-specific behavior follows Obsidian's native device and window classes where available.

## Development

Source styles live in `src/`; the root `theme.css` is the distributable file. Rebuild it after SCSS changes with Node.js available:

```bash
npx --yes sass src/theme.scss theme.css --no-source-map
```

Commit the generated `theme.css` with its source changes. Run `git diff --check` before opening a pull request or publishing a release.

## Credits

Lumin is based on [Cupertino](https://github.com/aaaaalexis/obsidian-cupertino). It includes MIT-licensed snippets from [Minimal](https://github.com/kepano/obsidian-minimal) and public-domain references from [Alternative Checkboxes Reference Set](https://github.com/damiankorcz/Alternative-Checkboxes-Reference-Set). See [third-party notices](THIRD_PARTY_NOTICES.md) for the applicable attribution and terms.

Craft is a visual reference only; this repository does not redistribute its code or assets.

## License

YiXuan's original Lumin contributions are released under the [MIT License](LICENSE). Included third-party material remains under its own terms in [third-party notices](THIRD_PARTY_NOTICES.md).
