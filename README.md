# Markdown Tabs

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

把 `main.js`、`manifest.json`、`styles.css` 复制到 `<库>/.obsidian/plugins/markdown-tabs/`，在设置中启用。

## 开发

```
npm install
npm run dev    # watch 构建
npm run build  # 类型检查 + 生产构建
npm test       # 解析器测试
```
