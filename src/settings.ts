/** 样式可调参数，单位均为 px */
export interface TabStyleParams {
	/** 标签上下内边距 */
	tabPaddingV: number;
	/** 标签左右内边距 */
	tabPaddingH: number;
	/** 内容区上下内边距 */
	contentPaddingV: number;
	/** 内容区左右内边距 */
	contentPaddingH: number;
	/** 标签字号 */
	fontSize: number;
	/** 圆角 */
	borderRadius: number;
	/** 边框宽度 */
	borderWidth: number;
	/** 标签之间的间距，0 为连通式 */
	tabGap: number;
	/** 连续 tabs 块之间的垂直间距 */
	blockGap: number;
}

export interface Preset {
	name: string;
	params: TabStyleParams;
}

export const PRESETS: Record<string, Preset> = {
	default: {
		name: "默认",
		params: {
			tabPaddingV: 12,
			tabPaddingH: 20,
			contentPaddingV: 12,
			contentPaddingH: 20,
			fontSize: 16,
			borderRadius: 8,
			borderWidth: 1,
			tabGap: 0,
			blockGap: 16,
		},
	},
	compact: {
		name: "紧凑",
		params: {
			tabPaddingV: 4,
			tabPaddingH: 10,
			contentPaddingV: 6,
			contentPaddingH: 12,
			fontSize: 14,
			borderRadius: 6,
			borderWidth: 1,
			tabGap: 0,
			blockGap: 8,
		},
	},
	spacious: {
		name: "宽松",
		params: {
			tabPaddingV: 16,
			tabPaddingH: 28,
			contentPaddingV: 18,
			contentPaddingH: 28,
			fontSize: 17,
			borderRadius: 10,
			borderWidth: 1,
			tabGap: 0,
			blockGap: 24,
		},
	},
};

export const CUSTOM_PRESET_ID = "custom";

export interface MDTabbedSettings {
	preset: string;
	custom: TabStyleParams;
}

export const DEFAULT_SETTINGS: MDTabbedSettings = {
	preset: "default",
	custom: { ...PRESETS.default.params },
};

export function resolveParams(settings: MDTabbedSettings): TabStyleParams {
	if (settings.preset === CUSTOM_PRESET_ID) return settings.custom;
	return PRESETS[settings.preset]?.params ?? PRESETS.default.params;
}

const VAR_NAMES = [
	"--tab-padding",
	"--tab-content-padding",
	"--tab-font-size",
	"--tab-border-radius",
	"--tab-border-width",
	"--tab-gap",
	"--tab-block-gap",
];

export const HAS_GAP_CLASS = "md-tabbed-has-gap";

/** 把参数写到 body 的内联 CSS 变量上，即时生效且不影响 styles.css 兜底值 */
export function applyTabStyle(params: TabStyleParams): void {
	const style = document.body.style;
	style.setProperty("--tab-padding", `${params.tabPaddingV}px ${params.tabPaddingH}px`);
	style.setProperty(
		"--tab-content-padding",
		`${params.contentPaddingV}px ${params.contentPaddingH}px`
	);
	style.setProperty("--tab-font-size", `${params.fontSize}px`);
	style.setProperty("--tab-border-radius", `${params.borderRadius}px`);
	style.setProperty("--tab-border-width", `${params.borderWidth}px`);
	style.setProperty("--tab-gap", `${params.tabGap}px`);
	style.setProperty("--tab-block-gap", `${params.blockGap}px`);
	document.body.classList.toggle(HAS_GAP_CLASS, params.tabGap > 0);
}

/** 插件卸载时移除内联变量，回落到 styles.css 默认值 */
export function clearTabStyle(): void {
	for (const name of VAR_NAMES) {
		document.body.style.removeProperty(name);
	}
	document.body.classList.remove(HAS_GAP_CLASS);
}
