import { Plugin } from "obsidian";
import { parseTabs } from "./util/parsing";
import { renderTabs } from "./ui/rendering";
import { TabSuggest } from "./ui/suggest";
import { MDTabbedSettingTab } from "./ui/settingTab";
import {
	applyTabStyle,
	clearTabStyle,
	DEFAULT_SETTINGS,
	MDTabbedSettings,
	resolveParams,
} from "./settings";

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
	settings: MDTabbedSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();
		applyTabStyle(resolveParams(this.settings));
		this.addSettingTab(new MDTabbedSettingTab(this.app, this));

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

	onunload() {
		clearTabStyle();
	}

	async loadSettings() {
		const data = (await this.loadData()) as Partial<MDTabbedSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
		// custom 需深合并：旧版本存档可能缺少后加的参数
		this.settings.custom = Object.assign({}, DEFAULT_SETTINGS.custom, data?.custom);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		applyTabStyle(resolveParams(this.settings));
	}
}
