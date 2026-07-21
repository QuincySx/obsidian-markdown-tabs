import {
	App,
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	MarkdownRenderer,
} from "obsidian";
import { Tabs } from "../tabs";

/** 拖拽超过该位移才算滚动，否则视为点击 */
const DRAG_THRESHOLD_PX = 4;

export async function renderTabs(
	app: App,
	tabs: Tabs,
	source: string,
	container: HTMLElement,
	ctx: MarkdownPostProcessorContext
): Promise<void> {
	if (!tabs.hasTabs()) {
		renderCodeBlock(container, source, "tabs");
		return;
	}

	// 每次渲染独立生命周期：section 重绘时旧渲染产物自动卸载
	const child = new MarkdownRenderChild(container);
	ctx.addChild(child);

	const divMain = container.createEl("div", { cls: "md-tabbed" });

	if (tabs.preamble) {
		const preambleEl = divMain.createEl("div", { cls: "md-tabbed-preamble" });
		await MarkdownRenderer.render(app, tabs.preamble, preambleEl, ctx.sourcePath, child);
	}

	const divTabs = divMain.createEl("div", { cls: "md-tabbed-tabs" });
	const divContent = divMain.createEl("div", { cls: "md-tabbed-content" });

	// --- 拖拽滚动：状态按渲染实例隔离；document 级监听保证元素外松开也能结束 ---
	let dragging = false;
	let moved = false;
	let dragStartX = 0;
	let dragStartScroll = 0;

	divTabs.addEventListener("mousedown", (e) => {
		dragging = true;
		moved = false;
		dragStartX = e.clientX;
		dragStartScroll = divTabs.scrollLeft;
	});
	child.registerDomEvent(document, "mousemove", (e) => {
		if (!dragging) return;
		const dx = e.clientX - dragStartX;
		if (Math.abs(dx) > DRAG_THRESHOLD_PX) moved = true;
		if (moved) {
			e.preventDefault();
			divTabs.scrollLeft = dragStartScroll - dx;
		}
	});
	child.registerDomEvent(document, "mouseup", () => {
		dragging = false;
		// click 事件在 mouseup 之后同步派发，挪到下一拍再复位，
		// 让 click 处理器能看到拖拽标记并抑制误切换
		setTimeout(() => {
			moved = false;
		}, 0);
	});

	// --- tab 条与懒渲染内容 ---
	const panes = new Map<number, HTMLElement>();
	let activeId = tabs.active_id;

	const showTab = async (id: number) => {
		activeId = id;
		for (const tabEl of Array.from(divTabs.children) as HTMLElement[]) {
			tabEl.classList.toggle("md-tabbed-active", tabEl.dataset.tabId === String(id));
		}
		for (const [paneId, pane] of panes) {
			pane.style.display = paneId === id ? "" : "none";
		}
		const tab = tabs.tabs.find((t) => t.id === id);
		if (tab && !panes.has(id)) {
			// 懒渲染：首次激活才渲染内容，避免在隐藏容器里量错尺寸
			const pane = divContent.createEl("div", { cls: "md-tabbed-pane" });
			panes.set(id, pane);
			await MarkdownRenderer.render(app, tab.content, pane, ctx.sourcePath, child);
		}
	};

	const labelRenders: Promise<void>[] = [];
	for (const tab of tabs.tabs) {
		const divTab = divTabs.createEl("div", { cls: "md-tabbed-tab" });
		divTab.dataset.tabId = String(tab.id);
		if (tab.id === activeId) divTab.classList.add("md-tabbed-active");
		divTab.addEventListener("click", () => {
			if (moved) return; // 拖拽滚动后的抬起不算点击
			void showTab(tab.id);
		});
		labelRenders.push(
			MarkdownRenderer.render(app, tab.label, divTab, ctx.sourcePath, child)
		);
	}

	await Promise.all([...labelRenders, showTab(activeId)]);
}

export function renderCodeBlock(
	container: HTMLElement,
	source: string,
	language: string
): HTMLElement {
	const pre = container.createEl("pre", { cls: "md-tabbed-fallback" });
	const code = pre.createEl("code", { cls: `language-${language}` });
	code.appendText(source);
	container.createEl("div", {
		cls: "md-tabbed-hint",
		text: "未识别到标签页。语法：---tab 标题 分隔标签页，---tab* 标题 设默认激活；或用命令 Insert tabs block 插入模板。",
	});
	return pre;
}
