// 解析器测试：esbuild test/parse.test.ts --bundle --platform=node --format=cjs --outfile=test/parse.test.cjs && node test/parse.test.cjs
import { parseTabs } from "../src/util/parsing";

let failures = 0;
function check(name: string, cond: boolean) {
	if (cond) console.log(`ok   ${name}`);
	else {
		console.error(`FAIL ${name}`);
		failures++;
	}
}

// 基本解析：两个 tab，id 递增，内容 join
const basic = parseTabs("---tab 一\nline1\nline2\n---tab 二\nhello");
check("basic: tab count", basic.tabs.length === 2);
check("basic: ids", basic.tabs[0].id === 0 && basic.tabs[1].id === 1);
check("basic: labels", basic.tabs[0].label === "一" && basic.tabs[1].label === "二");
check("basic: content join", basic.tabs[0].content === "line1\nline2");
check("basic: default active 0", basic.active_id === 0);

// 星号 tab 设为默认激活
const starred = parseTabs("---tab 一\na\n---tab* 二\nb");
check("starred: active id", starred.active_id === 1);

// preamble 保留
const pre = parseTabs("前言第一行\n前言第二行\n---tab 一\n内容");
check("preamble preserved", pre.preamble === "前言第一行\n前言第二行");
check("preamble: tab content intact", pre.tabs[0].content === "内容");

// 形似分隔符但不匹配的行视为内容，不吞
const tricky = parseTabs("---tab 一\n---table 不是分隔\n---tab\n---tabx 也不是\nstill here");
check("tricky: no swallow", tricky.tabs.length === 1);
check(
	"tricky: content kept",
	tricky.tabs[0].content === "---table 不是分隔\n---tab\n---tabx 也不是\nstill here"
);

// CRLF：\r 不进入 label 和内容
const crlf = parseTabs("---tab 一\r\n内容\r\n---tab 二\r\nx");
check("crlf: label clean", crlf.tabs[0].label === "一");
check("crlf: content clean", crlf.tabs[0].content === "内容");

// 空内容 tab / 空块
const emptyTab = parseTabs("---tab 空");
check("empty tab content", emptyTab.tabs.length === 1 && emptyTab.tabs[0].content === "");
const empty = parseTabs("只有普通文本");
check("no tabs", !empty.hasTabs() && empty.preamble === "只有普通文本");

// 严格语法：两横、四横、空格、大写都不算分隔符（视为内容）
const strict = parseTabs("---tab 标准\na\n--tab 两横\n----tab 四横\n--- tab 空格\n---TAB 大写");
check("strict: only exact match counts", strict.tabs.length === 1);
check(
	"strict: variants kept as content",
	strict.tabs[0].content === "a\n--tab 两横\n----tab 四横\n--- tab 空格\n---TAB 大写"
);

if (failures > 0) {
	console.error(`${failures} failure(s)`);
	process.exit(1);
} else {
	console.log("all tests passed");
}
