# Tabbed Blocks

Show Markdown content in switchable tabs inside Obsidian's reading view.

## Usage

Write a `tabs` code block in a note and separate tabs with `---tab Title`; use `---tab* Title` for the tab that is active by default:

````markdown
```tabs
---tab Notes
The first tab's content, with full **Markdown** support.

---tab* Code
The default-active tab:

\```js
console.log("hello");
\```

---tab Table
| A | B |
|---|---|
| 1 | 2 |
```
````

You don't need to memorize the syntax:

- Run **"Insert tabs block"** from the command palette to insert a complete template
- Typing `---` inside a `tabs` block suggests `---tab` / `---tab*`
- If no tab is recognized, a syntax hint is shown right below the block

Features:

- **Lazy rendering**: tab content renders only when first activated — diagrams and code highlighting never mis-measure inside hidden containers
- **Drag to scroll**: when tabs overflow, hold and drag horizontally (dragging never triggers an accidental tab switch)
- Text before the first `---tab` is shown above the tabs as a preamble

## Installation

Copy `main.js`, `manifest.json`, `styles.css` into `<vault>/.obsidian/plugins/tabbed-blocks/` and enable the plugin in Settings → Community plugins. Or install via BRAT with the repository `QuincySx/obsidian-markdown-tabs`.

## Development

```
npm install
npm run dev    # watch build
npm run build  # type check + production build
npm test       # parser tests
```

---

# Tabbed Blocks（中文）

在 Obsidian 阅读模式中用标签页（tabs）展示 Markdown 内容。

## 用法

在笔记中写 `tabs` 代码块，用 `---tab 标题` 分隔每个标签页，`---tab* 标题` 表示默认激活：

````markdown
```tabs
---tab 说明
这里是第一个标签页的内容，支持完整 **Markdown**。

---tab* 代码
默认激活的标签页：

\```js
console.log("hello");
\```

---tab 表格
| A | B |
|---|---|
| 1 | 2 |
```
````

记不住语法也没关系：

- **命令面板**搜索 "Insert tabs block"，一键插入完整模板
- 在 `tabs` 块内输入 `---` 会自动补全 `---tab` / `---tab*`
- 没有识别到标签页时，渲染区会直接显示语法提示

特性：

- 标签页内容懒渲染：切到哪个才渲染哪个（图表、代码高亮不会因隐藏容器量错尺寸）
- 标签过多时可按住拖拽横向滚动（拖拽不会误触发切换）
- `---tab` 之前的文字会作为前言显示在标签页上方

## 安装

把 `main.js`、`manifest.json`、`styles.css` 复制到 `<库>/.obsidian/plugins/tabbed-blocks/`，在设置中启用。

## License

MIT
