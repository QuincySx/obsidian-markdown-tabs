import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";

interface TabSuggestion {
	insert: string;
	display: string;
	detail: string;
}

const SUGGESTIONS: TabSuggestion[] = [
	{ insert: "---tab ", display: "---tab 标题", detail: "新开一个标签页" },
	{ insert: "---tab* ", display: "---tab* 标题", detail: "新开标签页（默认激活）" },
];

/** 触发前缀：行首三个横线开头（可带 tab 字母和星号） */
const TRIGGER_RE = /^-{3}[a-zA-Z*]*$/;

/**
 * tabs 代码块内的语法补全：输入 --- 即弹出 ---tab / ---tab*。
 * 只在 tabs 代码块内生效，不影响普通文本。
 */
export class TabSuggest extends EditorSuggest<TabSuggestion> {
	constructor(app: App) {
		super(app);
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		_file: TFile | null
	): EditorSuggestTriggerInfo | null {
		const before = editor.getLine(cursor.line).substring(0, cursor.ch);
		if (!TRIGGER_RE.test(before)) return null;
		if (!insideTabsBlock(editor, cursor)) return null;
		return {
			start: { line: cursor.line, ch: 0 },
			end: cursor,
			query: before,
		};
	}

	getSuggestions(_ctx: EditorSuggestContext): TabSuggestion[] {
		return SUGGESTIONS;
	}

	renderSuggestion(s: TabSuggestion, el: HTMLElement): void {
		el.createEl("div", { text: s.display });
		el.createEl("small", { text: s.detail, cls: "md-tabbed-suggest-detail" });
	}

	selectSuggestion(s: TabSuggestion): void {
		const ctx = this.context;
		if (!ctx) return;
		ctx.editor.replaceRange(s.insert, ctx.start, ctx.end);
		ctx.editor.setCursor({ line: ctx.start.line, ch: s.insert.length });
	}
}

/** 从文档开头扫到光标行，判断是否处于 ```tabs 围栏内（近似：围栏内的嵌套围栏会误判） */
function insideTabsBlock(editor: Editor, cursor: EditorPosition): boolean {
	let inside = false;
	for (let l = 0; l < cursor.line; l++) {
		const t = editor.getLine(l).trimStart();
		if (!inside) {
			if (/^```tabs\b/.test(t)) inside = true;
		} else if (t.startsWith("```")) {
			inside = false;
		}
	}
	return inside;
}
