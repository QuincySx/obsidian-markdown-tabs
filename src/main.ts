import { MarkdownPostProcessorContext, Plugin } from "obsidian";
import { Tabs } from "./tabs";
import { parseTabs } from "./util/parsing";
import { render } from "./ui/rendering";

declare global {
	interface Window {
		md_tabbed_plugin: MDTabbedPlugin;
	}
}

export default class MDTabbedPlugin extends Plugin {
	async onload() {
		window.md_tabbed_plugin = this;
		this.registerCodeblockPostProcessorWithPriority(
			"tabs",
			-100,
			async (source, el, ctx) => this.renderTabs(source, el, ctx)
		);
	}

	/** Register a markdown codeblock post processor with the given priority. */
	public registerCodeblockPostProcessorWithPriority(
		language: string,
		priority: number,
		processor: (
			source: string,
			el: HTMLElement,
			ctx: MarkdownPostProcessorContext
		) => Promise<void>
	) {
		const registered = this.registerMarkdownCodeBlockProcessor(
			language,
			processor
		);
		registered.sortOrder = priority;
	}

	public async renderTabs(
		source: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	): Promise<void> {
		const tabs: Tabs = parseTabs(source);
		render(tabs, source, el, ctx);
	}
}
