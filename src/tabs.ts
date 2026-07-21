export class Tab {
	id = 0;
	label = "";
	content = "";
}

export class Tabs {
	tabs: Tab[] = [];
	active_id = 0;
	/** 第一个 ---tab 之前的内容（可能为空字符串） */
	preamble = "";

	public hasTabs(): boolean {
		return this.tabs.length > 0;
	}
}
