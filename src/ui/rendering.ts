import { MarkdownPostProcessorContext, MarkdownRenderer } from "obsidian";
import { Tabs } from "src/tabs";

let isDown = false;
let startX = 0;
let scrollLeft = 0;

export function render(
	tabs: Tabs,
	source: string,
	container: HTMLElement,
	ctx: MarkdownPostProcessorContext
): void {
	if (!tabs.hasTabs()) {
		renderCodeBlock(container, source, "html");
		return;
	}

	const plugin = window.md_tabbed_plugin;
	const divMain = container.createEl("div");
	const divTabs = divMain.createEl("div", { cls: ["md-tabbed-tabs"] });

	divTabs.addEventListener("mousedown", (e) => {
		isDown = true;
		startX = e.pageX - divTabs.offsetLeft;
		scrollLeft = divTabs.scrollLeft;
	});

	divTabs.addEventListener("mouseleave", () => {
		isDown = false;
	});

	divTabs.addEventListener("mouseup", () => {
		isDown = false;
	});

	divTabs.addEventListener("mousemove", (e) => {
		if (!isDown) return;
		e.preventDefault();
		const x = e.pageX - divTabs.offsetLeft;
		const walk = x - startX; // 3为滚动速度因子
		divTabs.scrollLeft = scrollLeft - walk;
	});

	let activeTab = tabs.active_id;

	// 创建选项卡
	for (let index = 0; index < tabs.tabs.length; index++) {
		const element = tabs.tabs[index];
		const classes = ["md-tabbed-tab"];
		if (index === activeTab) {
			classes.push("md-tabbed-active");
		}
		const divTab = divTabs.createEl("div", { cls: classes });
		divTab.dataset.tabId = element.id.toString(); // 确保设置为字符串
		divTab.onclick = () => {
			activeTab = element.id;
			updateTabs(); // 更新选项卡视图
		};
		MarkdownRenderer.render(
			plugin.app,
			element.label,
			divTab,
			ctx.sourcePath,
			plugin
		);
	}

	const divContent = divMain.createEl("div", { cls: ["md-tabbed-content"] });

	// 创建内容区域
	for (let index = 0; index < tabs.tabs.length; index++) {
		const element = tabs.tabs[index];
		const divTabContent = divContent.createEl("div");
		divTabContent.style.display = index === activeTab ? "" : "none"; // 初始隐藏非活动标签内容
		MarkdownRenderer.render(
			plugin.app,
			element.content,
			divTabContent,
			ctx.sourcePath,
			plugin
		);
	}

	// 更新选项卡视图的函数
	function updateTabs() {
		Array.from(divTabs.children).forEach((tab) => {
			// @ts-expect-error
			const tabId = tab?.dataset?.tabId;
			if (!tabId) return console.error("tabId is undefined");
			tab.classList.toggle(
				"md-tabbed-active",
				tabId === activeTab?.toString()
			); // 确保比较的是字符串
		});

		Array.from(divContent.children).forEach((content, index) => {
			const contentTabId = tabs.tabs?.[index]?.id?.toString(); // 确保为字符串
			if (!contentTabId)
				return console.error("contentTabId is undefined");
			// @ts-expect-error
			content.style.display =
				contentTabId === activeTab?.toString() ? "" : "none"; // 使用字符串比较
		});
	}
}

export function renderCodeBlock(
	container: HTMLElement,
	source: string,
	language?: string
): HTMLElement {
	const code = container.createEl("code", { cls: ["md-tabbed-tabs"] });
	if (language) {
		code.classList.add("language-" + language);
	}
	code.appendText(source);
	return code;
}
