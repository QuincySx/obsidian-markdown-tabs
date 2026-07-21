import { Plugin } from "obsidian";
import { parseTabs } from "./util/parsing";
import { renderTabs } from "./ui/rendering";
import { TabSuggest } from "./ui/suggest";

const TABS_TEMPLATE = [
	"```tabs",
	"---tab 标签一",
	"第一个标签页的内容。",
	"",
	"---tab* 标签二",
	"带星号 = 默认激活。",
	"```",
	"",
].join("\n");

export default class MDTabbedPlugin extends Plugin {
	onload() {
		this.registerMarkdownCodeBlockProcessor(
			"tabs",
			async (source, el, ctx) => {
				await renderTabs(this.app, parseTabs(source), source, el, ctx);
			},
			-100
		);

		// tabs 块内输入 --- 时自动补全分隔符
		this.registerEditorSuggest(new TabSuggest(this.app));

		this.addCommand({
			id: "insert-tabs-block",
			name: "Insert tabs block",
			editorCallback: (editor) => {
				editor.replaceSelection(TABS_TEMPLATE);
			},
		});
	}
}
