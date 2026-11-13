import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('../', import.meta.url));
const candidates = [process.env.EDGE_PATH,
  process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Microsoft/Edge/Application/msedge.exe'),
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable'];
let executablePath;
for (const candidate of candidates.filter(Boolean)) {
  try { await fs.access(candidate); executablePath = candidate; break; } catch {}
}
if (!executablePath) throw new Error('Microsoft Edge not found. Set EDGE_PATH to its executable path.');
const browser = await chromium.launch({ executablePath, headless: true });
const checks = [];
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route('https://lumin.test/**', async route => {
    const filename = new URL(route.request().url()).pathname.slice(1);
    if (['app.css', 'theme.css'].includes(filename)) return route.fulfill({ contentType: 'text/css', body: await fs.readFile(path.join(root, filename), 'utf8') });
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head></head><body></body></html>' });
  });
  await page.goto('https://lumin.test/');
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://lumin.test/app.css"><link rel="stylesheet" href="https://lumin.test/theme.css"><style>body{display:block!important;overflow:auto!important;margin:0;padding:24px;background:var(--background-primary)}main{max-width:800px;margin:auto}.markdown-preview-view,.markdown-source-view{padding:0;overflow:visible;font-size:var(--font-text-size)}.code-background{position:relative}.HyperMD-codeblock-bg{position:absolute;inset:0}</style></head><body class="theme-light"><main>
  <section class="markdown-preview-view markdown-rendered"><h1>Typora-inspired note details</h1><p>正文与 <mark>高亮内容</mark>，键盘 <kbd>Ctrl</kbd> 与行内代码 <code>npm install</code>。</p><blockquote><p>引用文字</p><blockquote><p>嵌套引用</p></blockquote></blockquote><hr>
  <pre><code><span class="token comment">// 棕褐注释</span>
  <span class="token keyword">const</span> name = <span class="token string">"Lumin"</span>;</code></pre>
  <ul id="lists" class="has-list-bullet"><li><span class="list-bullet"></span>${'长文本 English 内容检查。'.repeat(8)}<ol start="99"><li>混合嵌套<ul><li>第三级列表</li></ul></li></ol></li><li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox">任务</li></ul>
  <table id="reading"><thead><tr><th>表头</th><th align="center">说明</th></tr></thead><tbody><tr><td>第一行</td><td>多行内容<br>第二行</td></tr><tr><td>第二行</td><td>内容</td></tr></tbody></table></section>
  <section class="markdown-source-view mod-cm6 is-live-preview cm-s-obsidian"><div class="cm-line HyperMD-quote"><span class="cm-quote">编辑态引用</span></div><div class="cm-line HyperMD-list-line"><span class="cm-formatting-list cm-formatting-list-ol">1. </span>编辑态列表</div><div class="code-background"><div class="HyperMD-codeblock-bg"></div><div class="cm-line HyperMD-codeblock"><span class="cm-comment">// 编辑态注释</span></div></div>
  <div class="cm-table-widget markdown-rendered"><div class="table-wrapper"><table id="editing"><thead><tr><th><div class="table-cell-wrapper"><div contenteditable="true">可编辑表头</div></div></th><th><div class="table-cell-wrapper">数量</div></th></tr></thead><tbody><tr><td><div class="table-cell-wrapper">内容</div></td><td><div class="table-cell-wrapper">42</div></td></tr></tbody></table></div></div></section>
  </main></body></html>`, { waitUntil: 'networkidle' });
  const requireEqual = (actual, expected, description) => {
    if (actual !== expected) throw new Error(`${description}: expected ${expected}, got ${actual}`);
  };
  for (const width of [1120, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const mode of ['light', 'dark']) {
      for (const palette of ['', 'lumin-mist', 'lumin-moss', 'lumin-warmgray']) {
        await page.evaluate(({ mode, palette }) => { document.body.className = `theme-${mode} ${palette}`; }, { mode, palette });
        const result = await page.evaluate(() => {
          const style = selector => getComputedStyle(document.querySelector(selector));
          const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
          const context = canvas.getContext('2d');
          const rgb = color => { context.fillStyle = color; context.fillRect(0, 0, 1, 1); return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3); };
          const luminance = color => rgb(color).map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
          const background = luminance(style('pre').backgroundColor);
          const contrast = ['comment', 'keyword', 'string'].map(token => { const foreground = luminance(style('.token.' + token).color); return (Math.max(background, foreground) + 0.05) / (Math.min(background, foreground) + 0.05); });
          return { overflow: document.documentElement.scrollWidth > innerWidth, codeRadius: style('pre').borderRadius,
            tableRadius: style('#reading').borderRadius, headerCorner: style('#reading th').borderStartStartRadius,
            cellPadding: style('#editing th').padding, align: style('#reading th[align]').textAlign,
            comment: style('.token.comment').color, editorComment: style('.cm-comment').color,
            quoteBackground: style('blockquote').backgroundColor, quoteBorder: style('blockquote').borderInlineStartWidth,
            editorQuoteBorder: getComputedStyle(document.querySelector('.HyperMD-quote'), '::before').borderInlineStartWidth,
            quotePadding: style('blockquote').paddingTop, hrMargin: style('hr').marginTop, markRadius: style('mark').borderRadius,
            kbdRadius: style('kbd').borderRadius, listIndent: style('#lists li').marginInlineStart,
            nestedIndent: style('#lists ol li').marginInlineStart, marker: getComputedStyle(document.querySelector('#lists ol li'), '::marker').color,
            editorMarker: style('.cm-formatting-list').color, codeRgb: rgb(style('pre').backgroundColor), contrast };
        });
        requireEqual(result.overflow, false, 'Page overflow');
        requireEqual(result.codeRadius, '8px', 'Code radius'); requireEqual(result.tableRadius, '8px', 'Table radius');
        requireEqual(result.headerCorner, '7px', 'Header corner'); requireEqual(result.cellPadding, '0px', 'Editor cell padding');
        requireEqual(result.align, 'center', 'Table alignment'); requireEqual(result.comment, result.editorComment, 'Comment color');
        requireEqual(result.quoteBackground, 'rgba(0, 0, 0, 0)', 'Quote background'); requireEqual(result.quotePadding, '0px', 'Quote padding');
        requireEqual(result.quoteBorder, result.editorQuoteBorder, 'Quote border');
        requireEqual(result.hrMargin, '16px', 'Rule spacing'); requireEqual(result.markRadius, '3px', 'Highlight radius');
        requireEqual(result.kbdRadius, '4px', 'Key radius'); requireEqual(result.listIndent, '30px', 'List indent');
        requireEqual(result.nestedIndent, result.listIndent, 'Nested list indent'); requireEqual(result.marker, result.editorMarker, 'List marker');
        if (result.contrast.some(ratio => ratio < 4.5)) throw new Error(`Code contrast too low: ${result.contrast}`);
        if (!palette && Math.max(...result.codeRgb) - Math.min(...result.codeRgb) > 1) throw new Error('Default code background is not neutral.');
        const before = await page.locator('#reading th').first().evaluate(element => getComputedStyle(element).backgroundColor);
        await page.locator('#reading th').first().hover();
        requireEqual(await page.locator('#reading th').first().evaluate(element => getComputedStyle(element).backgroundColor), before, 'Header hover');
        await page.locator('[contenteditable]').click();
        await page.evaluate(() => document.activeElement.blur());
        checks.push({ width, mode, palette: palette || 'default', minimumCodeContrast: Math.min(...result.contrast).toFixed(2) });
      }
    }
  }
  await page.emulateMedia({ media: 'print' });
  requireEqual(await page.locator('pre').evaluate(element => getComputedStyle(element).borderRadius), '8px', 'Print code radius');
  await page.emulateMedia({ media: 'screen' });
  await page.setViewportSize({ width: 1120, height: 800 });
  // Model native Reading wrappers and CodeMirror's direct line children.
  const typographyChecks = [];
  for (const fontSize of [16, 20]) {
    for (const width of [390, 1120]) {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://lumin.test/app.css"><link rel="stylesheet" href="https://lumin.test/theme.css"><style>body{display:block;overflow:auto;--font-text-size:${fontSize}px}.sample{width:min(680px,calc(100vw - 48px));font-size:var(--font-text-size);height:auto!important;padding:0!important;overflow:visible;scrollbar-gutter:auto}.sample .cm-scroller{scrollbar-gutter:auto}.cm-content{width:100%!important}.cm-line{white-space:pre-wrap}.markdown-preview-section{padding:0!important}</style></head><body class="theme-light"><section id="reading-spacing" class="sample markdown-preview-view markdown-rendered"><div class="markdown-preview-section"><div class="el-p"><p id="read-first">第一段正文 English</p></div><div class="el-p"><p id="read-second">第二段正文 English</p></div><div class="el-h2"><h2 id="read-heading">标题</h2></div><div class="el-p"><p id="read-after">标题后的正文</p></div><div class="el-p"><p id="read-wrap">${'自然换行的正文 English text。'.repeat(6)}</p></div></div></section><section id="edit-spacing" class="sample markdown-source-view mod-cm6 is-live-preview cm-s-obsidian"><div class="cm-scroller"><div class="cm-content" contenteditable="true"><div class="cm-line" id="edit-first">第一段正文 English</div><div class="cm-line" id="blank"><br></div><div class="cm-line" id="edit-second">第二段正文 English</div><div class="cm-line"><br></div><div class="cm-line HyperMD-header HyperMD-header-2" id="edit-heading"><span class="cm-header-2">标题</span></div><div class="cm-line"><br></div><div class="cm-line" id="edit-after">标题后的正文</div><div class="cm-line"><br></div><div class="cm-line" id="edit-wrap">${'自然换行的正文 English text。'.repeat(6)}</div><div class="cm-line" id="extra-blank"><br></div><div class="cm-line"><br></div><div class="cm-line HyperMD-codeblock" id="code-blank"><br></div><div class="cm-line HyperMD-quote" id="quote-blank"><br></div><div class="cm-line HyperMD-list-line" id="list-blank"><br></div><div class="cm-line" id="spaces">   </div></div></div></section><section class="sample markdown-source-view mod-cm6 cm-s-obsidian"><div class="cm-scroller"><div class="cm-content"><div class="cm-line" id="source-blank"><br></div></div></div></section></body></html>`, { waitUntil: 'load' });
      const metrics = await page.evaluate(() => {
        const rect = id => document.getElementById(id).getBoundingClientRect();
        const gap = (a,b) => rect(b).top - rect(a).bottom;
        return { readGap: gap('read-first','read-second'), editGap: gap('edit-first','edit-second'),
          readBeforeHeading: gap('read-second','read-heading'), editBeforeHeading: gap('edit-second','edit-heading'),
          readAfterHeading: gap('read-heading','read-after'), editAfterHeading: gap('edit-heading','edit-after'),
          readLine: rect('read-first').height, editLine: rect('edit-first').height,
          readWrap: rect('read-wrap').height, editWrap: rect('edit-wrap').height,
          blank: rect('blank').height, extraBlank: rect('extra-blank').height,
          sourceBlank: rect('source-blank').height, codeBlank: rect('code-blank').height,
          codeLineHeight: parseFloat(getComputedStyle(document.getElementById('code-blank')).lineHeight),
          quoteBlank: rect('quote-blank').height, listBlank: rect('list-blank').height,
          spaces: document.getElementById('spaces').textContent };
      });
      for (const [reading, editing] of [['readGap','editGap'], ['readBeforeHeading','editBeforeHeading'], ['readAfterHeading','editAfterHeading'], ['readLine','editLine'], ['readWrap','editWrap']]) {
        if (Math.abs(metrics[reading] - metrics[editing]) > 1) throw new Error(`Typography ${fontSize}/${width}: ${reading}=${metrics[reading]}, ${editing}=${metrics[editing]}`);
      }
      for (const key of ['sourceBlank','quoteBlank','listBlank']) {
        if (metrics[key] < fontSize * 1.5) throw new Error(`${key} was compressed: ${metrics[key]}`);
      }
      if (Math.abs(metrics.codeBlank - metrics.codeLineHeight) > 1) throw new Error('Empty code line lost its code line height');
      requireEqual(metrics.blank, metrics.extraBlank, 'Consecutive blank lines remain individually editable');
      requireEqual(metrics.spaces, '   ', 'Literal source spaces are preserved');
      await page.locator('#blank').click();
      await page.locator('#blank').evaluate(element => element.classList.add('cm-active'));
      requireEqual(await page.locator('#blank').evaluate(element => element.getBoundingClientRect().height), metrics.blank, 'Caret does not change empty line height');
      await page.keyboard.type('输入');
      requireEqual(await page.locator('#blank').textContent(), '输入', 'Typing into a compact blank line');
      if (await page.locator('#blank').evaluate(element => element.getBoundingClientRect().height) < fontSize * 1.5) throw new Error('Typed line did not regain normal height');
      typographyChecks.push({ fontSize, width, ...metrics });
    }
  }
  console.log(JSON.stringify({ typographyChecks }, null, 2));
  await page.setViewportSize({ width: 1120, height: 800 });
  const sidebarChecks = [];
  // Obsidian updateFrameless keeps the toggle in the Ribbon on Windows.
  // With no Ribbon, or macOS's hidden title bar, it moves the same element
  // between the dock header (expanded) and root header (collapsed).
  for (const platform of ['windows', 'macos']) {
    for (const frame of ['hidden', 'visible', 'fullscreen']) {
      for (const ribbon of ['pinned', 'hidden', 'hover']) {
        for (const naming of ['left', 'primary']) {
          const inHeader = ribbon === 'hidden' || (platform === 'macos' && frame !== 'visible');
          const bodyClasses = `mod-${platform} is-focused is-frameless theme-light ${frame === 'visible' ? '' : 'is-hidden-frameless'} ${frame === 'fullscreen' ? 'is-fullscreen' : ''} ${ribbon === 'hidden' ? '' : 'show-ribbon'} ${ribbon === 'hover' ? 'hover-ribbon' : ''}`;
          await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://lumin.test/app.css"><link rel="stylesheet" href="https://lumin.test/theme.css"><style>body{margin:0}.workspace{width:100vw;height:calc(100vh - 30px)}.mod-sidedock{flex:none;width:320px}.mod-sidedock.is-sidedock-collapsed{width:0!important;min-width:0;padding:0!important;margin:0!important;overflow:hidden}.mod-root{flex:1}.workspace-tab-header-container-inner{flex:1}</style></head><body class="${bodyClasses}"><div class="workspace is-left-sidedock-open"><div class="workspace-ribbon mod-${naming}"><div class="sidebar-toggle-button mod-left"><div class="clickable-icon"><svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="2" width="22" height="20" rx="4"/><rect x="4" y="5" width="2" height="14" rx="2" fill="currentColor" class="sidebar-toggle-icon-inner"/></svg></div></div><div class="side-dock-actions"><div class="side-dock-ribbon-action clickable-icon">⌘</div></div></div><div class="workspace-split mod-horizontal mod-sidedock mod-${naming}-split"><div class="workspace-tabs mod-top mod-top-left-space"><div class="workspace-tab-header-container"><div class="workspace-tab-header-container-inner"><div class="workspace-tab-header is-active"><div class="workspace-tab-header-inner"><div class="workspace-tab-header-inner-icon"><svg class="svg-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h6l2-3h8a2 2 0 0 1 2 2v13H3Z"/></svg></div></div></div><div class="workspace-tab-header"><div class="workspace-tab-header-inner"><div class="workspace-tab-header-inner-icon"><svg class="svg-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg></div></div></div></div></div></div></div><div class="workspace-split mod-vertical mod-root"><div class="workspace-tabs mod-top"><div class="workspace-tab-header-container"><div class="workspace-tab-header-container-inner">笔记</div></div></div></div></div></body></html>`, { waitUntil: 'load' });
          await page.evaluate(inHeader => {
            const workspace = document.querySelector('.workspace');
            const dock = document.querySelector('.mod-sidedock');
            const ribbon = document.querySelector('.workspace-ribbon');
            const toggle = document.querySelector('.sidebar-toggle-button');
            const dockHeader = dock.querySelector('.workspace-tab-header-container');
            const rootTabs = document.querySelector('.mod-root .workspace-tabs');
            window.sidebarClickCount = 0;
            if (inHeader) dockHeader.append(toggle);
            toggle.addEventListener('click', () => {
              window.sidebarClickCount++;
              const expanded = workspace.classList.toggle('is-left-sidedock-open');
              dock.classList.toggle('is-sidedock-collapsed', !expanded);
              ribbon.classList.toggle('is-collapsed', !expanded);
              rootTabs.classList.toggle('mod-top-left-space', !expanded);
              if (inHeader) {
                if (expanded) dockHeader.append(toggle);
                else rootTabs.querySelector('.workspace-tab-header-container').prepend(toggle);
              }
            });
          }, inHeader);
          for (const width of [240, 480]) {
            await page.locator('.mod-sidedock').evaluate((element, width) => element.style.width = width + 'px', width);
            await page.evaluate(width => document.body.classList.toggle('theme-dark', width === 480), width);
            // Include the collapsed-dock hover feature, which must not cover the toggle.
            await page.evaluate(width => document.body.classList.toggle('hover-sidedock', width === 480), width);
            for (const expanded of [true, false]) {
              if (ribbon === 'hover' && !inHeader) {
                const bounds = await page.locator('.workspace-ribbon').boundingBox();
                await page.mouse.move(1, bounds.y + 80);
              }
              const geometry = await page.locator('.sidebar-toggle-button').evaluate(element => {
                const icon = element.querySelector('.clickable-icon');
                const rect = icon.getBoundingClientRect();
                const parent = element.parentElement.getBoundingClientRect();
                const action = document.querySelector('.side-dock-ribbon-action').getBoundingClientRect();
                const glyph = icon.querySelector('svg').getBoundingClientRect();
                const fileIcon = document.querySelector('.mod-sidedock .workspace-tab-header-inner-icon svg').getBoundingClientRect();
                const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
                return { rect: rect.toJSON(), parent: parent.toJSON(), position: getComputedStyle(element).position,
                  anchor: getComputedStyle(element).getPropertyValue('position-anchor'),
                  noDrag: [element, ...element.querySelectorAll('*')].every(node => getComputedStyle(node).getPropertyValue('-webkit-app-region') === 'no-drag'),
                  clickable: !!hit && element.contains(hit),
                  fileCenterOffset: glyph.y + glyph.height / 2 - fileIcon.y - fileIcon.height / 2,
                  actionCenterOffset: rect.x + rect.width / 2 - action.x - action.width / 2,
                  withinParent: glyph.left >= parent.left - 1 && glyph.right <= parent.right + 1 && glyph.top >= parent.top - 1 && glyph.bottom <= parent.bottom + 1,
                  visible: rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0 };
              });
              const label = `${platform}/${frame}/${ribbon}/${naming}/${width}/${expanded}`;
              if (platform === 'windows' && !inHeader) requireEqual(Math.abs(geometry.actionCenterOffset) < 1, true, `${label}: toggle aligns with Ribbon actions`);
              // This native app.css snapshot supplies tab icon sizing for mod-left-split.
              if (platform === 'windows' && ribbon === 'pinned' && naming === 'left' && expanded) requireEqual(Math.abs(geometry.fileCenterOffset) < 1, true, `${label}: file icon vertical offset ${geometry.fileCenterOffset}`);
              requireEqual(geometry.position, 'relative', `${label}: native toggle position`);
              requireEqual(['auto', 'normal', ''].includes(geometry.anchor), true, `${label}: no cross-panel anchor`);
              for (const key of ['noDrag', 'clickable', 'withinParent', 'visible']) requireEqual(geometry[key], true, `${label}: ${key} ${JSON.stringify(geometry)}`);
              await page.locator('.sidebar-toggle-button .clickable-icon').click();
              requireEqual(await page.locator('.workspace').evaluate(element => element.classList.contains('is-left-sidedock-open')), !expanded, `${label}: click toggles sidebar`);
            }
          }
          requireEqual(await page.evaluate(() => window.sidebarClickCount), 4, 'Each toggle click fires once');
          sidebarChecks.push({ platform, frame, ribbon, naming, widths: [240, 480], clicks: 4 });
        }
      }
    }
  }
  console.log(JSON.stringify({ sidebarChecks }, null, 2));
  // Mermaid, graph view and Canvas must follow every palette in both modes.
  // Mermaid injects ID-scoped styles, so the fixture carries the same inline
  // rules Obsidian renders and proves the theme's overrides still win.
  const integrationChecks = [];
  const graphNodeByPalette = {};
  for (const width of [1120, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const mode of ['light', 'dark']) {
      for (const palette of ['', 'lumin-mist', 'lumin-moss', 'lumin-warmgray']) {
        await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://lumin.test/app.css"><link rel="stylesheet" href="https://lumin.test/theme.css"><style>body{display:block;overflow:auto;margin:0;padding:24px;background:var(--background-primary)}main{max-width:800px}.canvas-wrapper{position:relative!important;width:360px;height:220px}</style></head><body><main>
  <section class="markdown-rendered"><div class="mermaid"><svg id="mermaid-1" width="1200" height="120" aria-roledescription="flowchart-v2"><style>#mermaid-1 .node rect{fill:#ECECFF;stroke:#9370DB}#mermaid-1 text{fill:#333}#mermaid-1 .flowchart-link{stroke:#333}</style><svg><rect id="probe-shape" style="fill:var(--lumin-diagram-surface);stroke:var(--lumin-diagram-border)"></rect><path id="probe-line" style="stroke:var(--lumin-diagram-line)"></path></svg><g class="node"><rect width="60" height="30"></rect></g><path class="flowchart-link" d="M0 0L10 10"></path><text id="mermaid-text">A</text><foreignObject width="60" height="20"><div class="nodeLabel" xmlns="http://www.w3.org/1999/xhtml">A</div></foreignObject></svg></div></section>
  <section class="graph-view-outer"><div class="graph-view-container"><div class="graph-view color-fill"></div><div class="graph-view color-line"></div><div class="graph-view color-text"></div><div class="graph-controls"><div class="graph-control-section"><div class="graph-control-section-header">Filters</div></div></div></div></section>
  <section class="canvas-wrapper"><svg class="canvas-background"><circle cx="4" cy="4" r="1"></circle></svg><div class="canvas-node"><div class="canvas-node-container"></div><div class="canvas-node-label">Note</div></div></section>
  </main></body></html>`, { waitUntil: 'load' });
        await page.evaluate(({ mode, palette }) => { document.body.className = `theme-${mode} ${palette}`; }, { mode, palette });
        const result = await page.evaluate(() => {
          const style = (selector, property) => getComputedStyle(document.querySelector(selector)).getPropertyValue(property);
          const probe = (property, value) => {
            const element = document.createElement('div');
            element.style.setProperty(property, value);
            document.body.append(element);
            const computed = getComputedStyle(element).getPropertyValue(property);
            element.remove();
            return computed;
          };
          return { overflow: document.documentElement.scrollWidth > innerWidth,
            filter: style('.mermaid > svg', 'filter'),
            nodeFill: style('#mermaid-1 .node rect', 'fill'), probeFill: style('#probe-shape', 'fill'),
            nodeStroke: style('#mermaid-1 .node rect', 'stroke'), probeStroke: style('#probe-shape', 'stroke'),
            line: style('.flowchart-link', 'stroke'), probeLine: style('#probe-line', 'stroke'),
            text: style('#mermaid-text', 'fill'), labelColor: style('.nodeLabel', 'color'), textNormal: probe('color', 'var(--text-normal)'),
            graphNode: style('.graph-view.color-fill', 'color'), graphLine: style('.graph-view.color-line', 'color'), textMuted: probe('color', 'var(--text-muted)'),
            graphBlur: style('.graph-controls', 'backdrop-filter'),
            canvasBackground: style('.canvas-wrapper', 'background-color'), canvasPrimary: probe('background-color', 'var(--background-primary)'),
            canvasDot: style('.canvas-background circle', 'fill'), dotDefault: probe('background-color', 'var(--color-base-30)'),
            nodeRadius: style('.canvas-node-container', 'border-radius'), canvasLabel: style('.canvas-node-label', 'color') };
        });
        const label = `${mode}/${palette || 'default'}/${width}`;
        requireEqual(result.overflow, false, `${label}: diagram overflow`);
        requireEqual(result.filter, 'none', `${label}: Mermaid filter`);
        requireEqual(result.nodeFill, result.probeFill, `${label}: Mermaid node fill`);
        requireEqual(result.nodeStroke, result.probeStroke, `${label}: Mermaid node stroke`);
        requireEqual(result.line, result.probeLine, `${label}: Mermaid edge`);
        requireEqual(result.text, result.textNormal, `${label}: Mermaid text`);
        requireEqual(result.labelColor, result.textNormal, `${label}: Mermaid HTML label`);
        requireEqual(result.graphNode === result.graphLine, false, `${label}: Graph nodes differ from links`);
        requireEqual(result.graphNode === result.textMuted, false, `${label}: Graph nodes follow palette`);
        requireEqual(result.graphBlur.includes('blur'), true, `${label}: Graph controls blur`);
        requireEqual(result.canvasBackground === result.canvasPrimary, false, `${label}: Canvas surface separates from notes`);
        requireEqual(result.canvasDot === result.dotDefault, false, `${label}: Canvas dot pattern`);
        requireEqual(result.nodeRadius, '16px', `${label}: Canvas card radius`);
        requireEqual(result.canvasLabel, result.textMuted, `${label}: Canvas label contrast`);
        graphNodeByPalette[`${mode}:${palette || 'default'}`] = result.graphNode;
        integrationChecks.push({ width, mode, palette: palette || 'default', graphNode: result.graphNode });
      }
    }
  }
  for (const mode of ['light', 'dark']) {
    const values = new Set(['default', 'lumin-mist', 'lumin-moss', 'lumin-warmgray'].map(palette => graphNodeByPalette[`${mode}:${palette}`]));
    if (values.size < 2) throw new Error(`Graph nodes ignore palette changes in ${mode}`);
  }
  console.log(JSON.stringify({ integrationChecks }, null, 2));
  console.log(JSON.stringify({ browser: 'Microsoft Edge', executablePath, version: browser.version(), checks, print: 'passed' }, null, 2));
} finally {
  await browser.close();
}
