import { Plugin } from "obsidian";
import { parseTabs } from "./util/parsing";
import { renderTabs } from "./ui/rendering";

export default class MDTabbedPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			"tabs",
			async (source, el, ctx) => {
				await renderTabs(this.app, parseTabs(source), source, el, ctx);
			},
			-100
		);
	}
}
