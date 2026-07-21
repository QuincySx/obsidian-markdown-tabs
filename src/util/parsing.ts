import { Tab, Tabs } from "../tabs";

// 只有完整匹配的行才是分隔符；其余一律视为内容，绝不吞掉。
// 严格语法：恰好三个横线 + tab（可带星号），不做宽容匹配，避免和普通文本撞车。
const TAB_LINE_RE = /^---tab(\*)?\s+(.+?)\s*$/;

export function parseTabs(source: string): Tabs {
	const tabs = new Tabs();
	const preambleLines: string[] = [];
	let current: Tab | null = null;
	let currentLines: string[] = [];
	let id = 0;

	const flush = () => {
		if (current) {
			current.content = currentLines.join("\n");
			tabs.tabs.push(current);
		}
		current = null;
		currentLines = [];
	};

	for (const line of source.split(/\r?\n/)) {
		const match = line.match(TAB_LINE_RE);
		if (match) {
			flush();
			current = new Tab();
			current.id = id++;
			current.label = match[2].trim();
			if (match[1] !== undefined) {
				tabs.active_id = current.id;
			}
		} else if (current) {
			currentLines.push(line);
		} else {
			// 第一个 ---tab 之前的内容保留为 preamble，不再静默丢弃
			preambleLines.push(line);
		}
	}
	flush();

	tabs.preamble = preambleLines.join("\n").trim();
	return tabs;
}
