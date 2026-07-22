import {
	App,
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	PluginSettingTab,
	Setting,
} from "obsidian";
import type MDTabbedPlugin from "../main";
import { CUSTOM_PRESET_ID, PRESETS, TabStyleParams } from "../settings";
import { parseTabs } from "../util/parsing";
import { renderTabs } from "./rendering";

const PREVIEW_SOURCE = [
	"---tab 标签一",
	"第一个标签页的内容，支持 **Markdown** 语法。",
	"",
	"---tab 标签二",
	"- 列表项一",
	"- 列表项二",
	"",
	"---tab* 标签三",
	"默认激活的标签页。",
].join("\n");

interface SliderSpec {
	key: keyof TabStyleParams;
	name: string;
	min: number;
	max: number;
}

const SLIDERS: SliderSpec[] = [
	{ key: "tabPaddingV", name: "标签上下边距", min: 0, max: 24 },
	{ key: "tabPaddingH", name: "标签左右边距", min: 4, max: 40 },
	{ key: "contentPaddingV", name: "内容上下边距", min: 0, max: 32 },
	{ key: "contentPaddingH", name: "内容左右边距", min: 4, max: 40 },
	{ key: "fontSize", name: "标签字号", min: 10, max: 24 },
	{ key: "borderRadius", name: "圆角", min: 0, max: 20 },
	{ key: "borderWidth", name: "边框宽度", min: 0, max: 4 },
	{ key: "tabGap", name: "标签间距", min: 0, max: 16 },
	{ key: "blockGap", name: "块垂直间距", min: 0, max: 48 },
];

export class MDTabbedSettingTab extends PluginSettingTab {
	plugin: MDTabbedPlugin;
	private previewChildren: MarkdownRenderChild[] = [];

	constructor(app: App, plugin: MDTabbedPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		this.unloadPreview();
		containerEl.empty();

		new Setting(containerEl).setName("样式").setHeading();

		new Setting(containerEl)
			.setName("预设")
			.setDesc("选择内置样式，或选「自定义」逐项调节下方参数。")
			.addDropdown((dropdown) => {
				for (const [id, preset] of Object.entries(PRESETS)) {
					dropdown.addOption(id, preset.name);
				}
				dropdown
					.addOption(CUSTOM_PRESET_ID, "自定义")
					.setValue(this.plugin.settings.preset)
					.onChange(async (value) => {
						this.plugin.settings.preset = value;
						await this.plugin.saveSettings();
						this.display();
					});
			});

		if (this.plugin.settings.preset === CUSTOM_PRESET_ID) {
			const custom = this.plugin.settings.custom;
			for (const spec of SLIDERS) {
				new Setting(containerEl).setName(spec.name).addSlider((slider) =>
					slider
						.setLimits(spec.min, spec.max, 1)
						.setValue(custom[spec.key])
						.onChange(async (value) => {
							custom[spec.key] = value;
							await this.plugin.saveSettings();
						})
				);
			}
		}

		new Setting(containerEl).setName("预览").setHeading();
		const previewEl = containerEl.createDiv({ cls: "md-tabbed-setting-preview" });
		void this.renderPreview(previewEl);
	}

	hide(): void {
		this.unloadPreview();
	}

	private unloadPreview(): void {
		for (const child of this.previewChildren) child.unload();
		this.previewChildren = [];
	}

	private async renderPreview(container: HTMLElement): Promise<void> {
		// renderTabs 需要 MarkdownPostProcessorContext，设置页里没有，构造最小 stub；
		// addChild 时接管 child 生命周期，hide/重绘时统一 unload
		const stubCtx: MarkdownPostProcessorContext = {
			docId: "md-tabbed-setting-preview",
			sourcePath: "",
			frontmatter: null,
			addChild: (child) => {
				this.previewChildren.push(child);
				child.load();
			},
			getSectionInfo: () => null,
		};
		// 上下渲染两个块，块垂直间距的效果才能看出来
		await renderTabs(this.app, parseTabs(PREVIEW_SOURCE), PREVIEW_SOURCE, container, stubCtx);
		await renderTabs(this.app, parseTabs(PREVIEW_SOURCE), PREVIEW_SOURCE, container, stubCtx);
	}
}
