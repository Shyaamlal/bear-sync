// Checks index.html builds the same Bear link as Roshar's .claude/bear_link.py for every daily note.
// Usage: node check.mjs <path to Roshar vault>
import { readFileSync, readdirSync } from "fs";
import { execFileSync } from "child_process";
const vault = process.argv[2];
const js = readFileSync(new URL("./index.html", import.meta.url), "utf8").split("<script>")[1].split("</script>")[0];
const pick = name => js.match(new RegExp(`(?:const ${name} = .*?;|function ${name}\\([\\s\\S]*?\\n})`))[0];
const { bodyOf, titleOf, bearUrl } = new Function(`${pick("MONTHS")}\n${pick("bodyOf")}\n${pick("titleOf")}\n${pick("bearUrl")}\nreturn { bodyOf, titleOf, bearUrl };`)();
let bad = 0;
for (const f of readdirSync(`${vault}/Stormlight`).filter(f => titleOf(f))) {
  const title = titleOf(f);
  const mine = new URLSearchParams(bearUrl(title, bodyOf(readFileSync(`${vault}/Stormlight/${f}`, "utf8"))).split("?")[1]);
  const ref = new URLSearchParams(execFileSync("python", [`${vault}/.claude/bear_link.py`, title, `${vault}/Stormlight/${f}`]).toString().split("\n")[0].split("?")[1]);
  const same = ["title", "mode", "text", "open_note"].every(k => mine.get(k) === ref.get(k));
  if (!same) bad++;
  console.log(same ? "ok  " : "DIFF", f, "->", title);
}
console.log(bad ? `${bad} mismatched` : "all match");
process.exit(bad ? 1 : 0);
